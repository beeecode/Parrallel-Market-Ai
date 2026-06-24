import type {
  CollectionSlug,
  DataFromCollectionSlug,
  Payload,
  RequiredDataFromCollectionSlug,
  Where,
} from 'payload'

export type SeedAction = 'created' | 'updated'

export type SeedResult<TSlug extends CollectionSlug> = {
  action: SeedAction
  doc: DataFromCollectionSlug<TSlug>
}

export type SeedTotals = {
  created: number
  updated: number
}

export class SeedSummary {
  private readonly totalsByCollection = new Map<string, SeedTotals>()

  record(collection: CollectionSlug, action: SeedAction): void {
    const totals = this.totalsByCollection.get(collection) ?? {
      created: 0,
      updated: 0,
    }

    totals[action] += 1
    this.totalsByCollection.set(collection, totals)
  }

  entries(): Array<[string, SeedTotals]> {
    return [...this.totalsByCollection.entries()].sort(([left], [right]) =>
      left.localeCompare(right),
    )
  }
}

type UpsertRecordArgs<TSlug extends CollectionSlug> = {
  collection: TSlug
  data: RequiredDataFromCollectionSlug<TSlug>
  payload: Payload
  where: Where
}

export async function upsertRecord<TSlug extends CollectionSlug>({
  collection,
  data,
  payload,
  where,
}: UpsertRecordArgs<TSlug>): Promise<SeedResult<TSlug>> {
  const existing = await payload.find({
    collection,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where,
  })

  const existingDocument = existing.docs[0]

  if (existingDocument) {
    // Payload's generic update overload cannot narrow a generated collection slug and ID
    // together here, so the cast is isolated to this framework boundary.
    const doc = (await payload.update({
      collection,
      data,
      depth: 0,
      id: existingDocument.id,
      overrideAccess: true,
    } as never)) as unknown as DataFromCollectionSlug<TSlug>

    return {
      action: 'updated',
      doc,
    }
  }

  const doc = await payload.create({
    collection,
    data,
    depth: 0,
    overrideAccess: true,
  })

  return {
    action: 'created',
    doc,
  }
}

export function requiredEnvironmentValue(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`${name} is required to run the development seed.`)
  }

  return value
}
