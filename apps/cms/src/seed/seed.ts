import { createHash } from 'crypto'
import 'dotenv/config'
import { getPayload, type Payload } from 'payload'

import config from '../payload.config'
import { collectionSlugs } from '../lib/collectionSlugs'
import {
  demoAgents,
  demoMessages,
  demoPages,
  demoProducts,
  demoSimulations,
} from './data/demoData'
import {
  requiredEnvironmentValue,
  SeedSummary,
  upsertRecord,
} from './helpers'

type DocumentID = number

const demoOwnerEmail = 'demo-owner@parallel-market-ai.local'
const demoAnalystEmail = 'demo-analyst@parallel-market-ai.local'

function deriveDevelopmentPassword(secret: string, purpose: string): string {
  const digest = createHash('sha256')
    .update(`${secret}:${purpose}`)
    .digest('base64url')
    .slice(0, 28)

  return `${digest}Aa1!`
}

function relationshipID(value: unknown): DocumentID {
  if (typeof value === 'number') {
    return value
  }

  throw new Error('Seed relationship did not resolve to a document ID.')
}

async function seedUsers(payload: Payload, summary: SeedSummary) {
  const payloadSecret = requiredEnvironmentValue('PAYLOAD_SECRET')
  const adminEmail = requiredEnvironmentValue('SEED_ADMIN_EMAIL').toLowerCase()
  const adminName = requiredEnvironmentValue('SEED_ADMIN_NAME')
  const adminPassword = requiredEnvironmentValue('SEED_ADMIN_PASSWORD')

  const admin = await upsertRecord({
    collection: collectionSlugs.users,
    data: {
      email: adminEmail,
      isActive: true,
      name: adminName,
      password: adminPassword,
      role: 'admin',
    },
    payload,
    where: {
      email: {
        equals: adminEmail,
      },
    },
  })
  summary.record(collectionSlugs.users, admin.action)

  const owner = await upsertRecord({
    collection: collectionSlugs.users,
    data: {
      company: 'Parallel Market Demo Ventures',
      email: demoOwnerEmail,
      isActive: true,
      name: 'Daniel Adeyemi',
      password: deriveDevelopmentPassword(payloadSecret, 'demo-business-owner'),
      role: 'business-owner',
    },
    payload,
    where: {
      email: {
        equals: demoOwnerEmail,
      },
    },
  })
  summary.record(collectionSlugs.users, owner.action)

  const analyst = await upsertRecord({
    collection: collectionSlugs.users,
    data: {
      company: 'Parallel Market AI',
      email: demoAnalystEmail,
      isActive: true,
      name: 'Amina Bello',
      password: deriveDevelopmentPassword(payloadSecret, 'demo-analyst'),
      role: 'analyst',
    },
    payload,
    where: {
      email: {
        equals: demoAnalystEmail,
      },
    },
  })
  summary.record(collectionSlugs.users, analyst.action)

  return {
    adminID: relationshipID(admin.doc.id),
    analystID: relationshipID(analyst.doc.id),
    ownerID: relationshipID(owner.doc.id),
  }
}

async function seedProducts(
  payload: Payload,
  summary: SeedSummary,
  ownerID: DocumentID,
): Promise<Map<string, DocumentID>> {
  const products = new Map<string, DocumentID>()

  for (const product of demoProducts) {
    const result = await upsertRecord({
      collection: collectionSlugs.products,
      data: {
        category: product.category,
        currentPrice: product.currentPrice,
        currency: 'NGN',
        description: product.description,
        name: product.name,
        owner: ownerID,
        slug: product.slug,
        status: 'active',
        targetLocation: product.targetLocation,
        targetMarket: product.targetMarket,
      },
      payload,
      where: {
        slug: {
          equals: product.slug,
        },
      },
    })

    summary.record(collectionSlugs.products, result.action)
    products.set(product.slug, relationshipID(result.doc.id))
  }

  return products
}

async function seedSimulations(
  payload: Payload,
  summary: SeedSummary,
  ownerID: DocumentID,
  products: Map<string, DocumentID>,
): Promise<Map<string, DocumentID>> {
  const simulations = new Map<string, DocumentID>()

  for (const simulation of demoSimulations) {
    const productID = products.get(simulation.productSlug)

    if (productID == null) {
      throw new Error(`Missing seeded product: ${simulation.productSlug}`)
    }

    const result = await upsertRecord({
      collection: collectionSlugs.simulations,
      data: {
        completedAt: simulation.completedAt,
        configuration: {
          additionalInstructions:
            'Use deterministic demo data only. No live AI simulation is connected.',
          competitorContext: 'Local alternatives, delivery platforms, and direct WhatsApp vendors.',
          customerSegments: [
            { segment: 'Price-sensitive buyers' },
            { segment: 'Convenience-focused buyers' },
            { segment: 'Trust-conscious buyers' },
          ],
          marketConditions: 'Competitive urban market with high mobile and chat commerce usage.',
          pricingStrategy: 'Test current pricing against discounts and smaller entry offers.',
          simulationGoal: 'Measure demand, objections, purchase intent, and repeat potential.',
        },
        conversationCount: simulation.conversationCount,
        currency: 'NGN',
        customerCount: simulation.customerCount,
        owner: ownerID,
        product: productID,
        purchaseRate: simulation.purchaseRate,
        repeatRate: simulation.repeatRate,
        revenueMaximum: simulation.revenueMaximum,
        revenueMinimum: simulation.revenueMinimum,
        startedAt: simulation.startedAt,
        status: 'completed',
        successProbability: simulation.successProbability,
        targetAudience: simulation.targetAudience,
        targetLocation: simulation.targetLocation,
        title: simulation.title,
      },
      payload,
      where: {
        and: [
          {
            owner: {
              equals: ownerID,
            },
          },
          {
            product: {
              equals: productID,
            },
          },
          {
            title: {
              equals: simulation.title,
            },
          },
        ],
      },
    })

    summary.record(collectionSlugs.simulations, result.action)
    simulations.set(simulation.title, relationshipID(result.doc.id))
  }

  return simulations
}

async function seedAgents(
  payload: Payload,
  summary: SeedSummary,
  simulationID: DocumentID,
): Promise<Map<string, DocumentID>> {
  const agents = new Map<string, DocumentID>()

  for (const agent of demoAgents) {
    const result = await upsertRecord({
      collection: collectionSlugs.customerAgents,
      data: {
        age: agent.age,
        buyingBehaviour: agent.buyingBehaviour,
        communicationStyle: agent.communicationStyle,
        incomeLevel: agent.incomeLevel,
        interests: agent.interests.map((interest) => ({ interest })),
        isActive: true,
        location: 'Lagos, Nigeria',
        name: agent.name,
        occupation: agent.occupation,
        personality: agent.personality,
        priceSensitivity: agent.priceSensitivity,
        simulation: simulationID,
      },
      payload,
      where: {
        and: [
          {
            simulation: {
              equals: simulationID,
            },
          },
          {
            name: {
              equals: agent.name,
            },
          },
        ],
      },
    })

    summary.record(collectionSlugs.customerAgents, result.action)
    agents.set(agent.name, relationshipID(result.doc.id))
  }

  return agents
}

async function seedConversations(
  payload: Payload,
  summary: SeedSummary,
  simulationID: DocumentID,
  agents: Map<string, DocumentID>,
): Promise<Map<string, DocumentID>> {
  const conversations = new Map<string, DocumentID>()

  for (const [agentName, agentID] of agents) {
    const result = await upsertRecord({
      collection: collectionSlugs.conversations,
      data: {
        customerAgent: agentID,
        endedAt: '2024-05-20T12:00:00.000Z',
        simulation: simulationID,
        startedAt: '2024-05-20T11:25:00.000Z',
        status: 'completed',
        summary: `${agentName}'s representative market-simulation conversation.`,
      },
      payload,
      where: {
        and: [
          {
            simulation: {
              equals: simulationID,
            },
          },
          {
            customerAgent: {
              equals: agentID,
            },
          },
        ],
      },
    })

    summary.record(collectionSlugs.conversations, result.action)
    conversations.set(agentName, relationshipID(result.doc.id))
  }

  return conversations
}

async function seedMessages(
  payload: Payload,
  summary: SeedSummary,
  simulationID: DocumentID,
  agents: Map<string, DocumentID>,
  conversations: Map<string, DocumentID>,
): Promise<void> {
  for (const message of demoMessages) {
    const agentID = agents.get(message.agentName)
    const conversationID = conversations.get(message.agentName)

    if (agentID == null || conversationID == null) {
      throw new Error(`Missing seeded conversation relationship for ${message.agentName}.`)
    }

    const result = await upsertRecord({
      collection: collectionSlugs.messages,
      data: {
        buyingIntent: message.buyingIntent,
        content: message.content,
        conversation: conversationID,
        customerAgent: agentID,
        metadata: {
          source: 'phase-2-demo-data',
        },
        objectionCategory: message.objectionCategory,
        senderType: message.senderType,
        sentiment: message.sentiment,
        sentAt: message.sentAt,
        simulation: simulationID,
      },
      payload,
      where: {
        and: [
          {
            conversation: {
              equals: conversationID,
            },
          },
          {
            sentAt: {
              equals: message.sentAt,
            },
          },
          {
            content: {
              equals: message.content,
            },
          },
        ],
      },
    })

    summary.record(collectionSlugs.messages, result.action)
  }
}

async function seedReport(
  payload: Payload,
  summary: SeedSummary,
  simulationID: DocumentID,
): Promise<void> {
  const result = await upsertRecord({
    collection: collectionSlugs.reports,
    data: {
      currency: 'NGN',
      currentAveragePrice: 4_200,
      customerObjections: [
        {
          description: 'The delivery fee reduces perceived value for nearby customers.',
          importance: 'high',
          label: 'Delivery fee is too high',
        },
        {
          description: 'Some buyers compare the menu unfavourably with lower-priced alternatives.',
          importance: 'medium',
          label: 'Prices are slightly expensive',
        },
        {
          description: 'Customers need stronger payment, review, and fulfilment trust signals.',
          importance: 'critical',
          label: 'Checkout page is not trusted',
        },
      ],
      executiveSummary:
        'The Shawarma Spot Menu is viable with targeted pricing, trust, and delivery improvements. Demand is strongest below the current average price, while purchase intent improves when customers see flexible portions, delivery incentives, and clear checkout assurance.',
      generatedAt: '2024-05-20T16:10:00.000Z',
      negativeSentiment: 23,
      neutralSentiment: 28,
      optimalPriceMaximum: 3_800,
      optimalPriceMinimum: 3_200,
      positiveFeedback: [
        {
          description: 'Customers responded strongly to flavour, freshness, and product quality.',
          importance: 'high',
          label: 'Taste and quality of food',
        },
        {
          description: 'Packaging was considered practical and suitable for delivery.',
          importance: 'medium',
          label: 'Packaging is good',
        },
        {
          description: 'Menu variety supports different tastes and purchase occasions.',
          importance: 'medium',
          label: 'Variety of options',
        },
      ],
      positiveSentiment: 49,
      recommendations: [
        {
          description: 'Meet customers in the channel already used for food discovery and ordering.',
          importance: 'high',
          label: 'Add WhatsApp ordering',
        },
        {
          description: 'Create a lower-cost entry point for price-sensitive customers.',
          importance: 'high',
          label: 'Offer smaller portions',
        },
        {
          description: 'Add reviews, delivery assurance, and clear payment protections.',
          importance: 'high',
          label: 'Build trust signals',
        },
      ],
      revenueMaximum: 6_800_000,
      revenueMinimum: 4_200_000,
      riskFactors: [
        {
          description: 'Delivery cost may suppress conversion for nearby orders.',
          importance: 'high',
          label: 'Delivery fee is too high',
        },
        {
          description: 'A weak checkout experience may stop otherwise interested customers.',
          importance: 'critical',
          label: 'Checkout is not trusted',
        },
        {
          description: 'Current pricing sits above the strongest demand range.',
          importance: 'medium',
          label: 'Price is slightly high',
        },
      ],
      simulation: simulationID,
      status: 'completed',
      successProbability: 72,
      version: 1,
    },
    payload,
    where: {
      and: [
        {
          simulation: {
            equals: simulationID,
          },
        },
        {
          version: {
            equals: 1,
          },
        },
      ],
    },
  })

  summary.record(collectionSlugs.reports, result.action)
}

async function seedPages(
  payload: Payload,
  summary: SeedSummary,
  authorID: DocumentID,
): Promise<void> {
  for (const page of demoPages) {
    const result = await upsertRecord({
      collection: collectionSlugs.pages,
      data: {
        author: authorID,
        metaDescription: page.metaDescription,
        metaTitle: page.metaTitle,
        publishedAt:
          page.status === 'published' ? '2024-05-20T16:15:00.000Z' : undefined,
        slug: page.slug,
        status: page.status,
        title: page.title,
      },
      payload,
      where: {
        slug: {
          equals: page.slug,
        },
      },
    })

    summary.record(collectionSlugs.pages, result.action)
  }
}

export async function runSeed(payload: Payload): Promise<SeedSummary> {
  const summary = new SeedSummary()
  const users = await seedUsers(payload, summary)
  const products = await seedProducts(payload, summary, users.ownerID)
  const simulations = await seedSimulations(payload, summary, users.ownerID, products)
  const shawarmaSimulationID = simulations.get('Shawarma Spot Menu')

  if (shawarmaSimulationID == null) {
    throw new Error('The Shawarma Spot Menu simulation was not seeded.')
  }

  const agents = await seedAgents(payload, summary, shawarmaSimulationID)
  const conversations = await seedConversations(
    payload,
    summary,
    shawarmaSimulationID,
    agents,
  )

  await seedMessages(
    payload,
    summary,
    shawarmaSimulationID,
    agents,
    conversations,
  )
  await seedReport(payload, summary, shawarmaSimulationID)
  await seedPages(payload, summary, users.analystID)

  return summary
}

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('The development seed is disabled when NODE_ENV is production.')
  }

  const payload = await getPayload({ config })

  try {
    const summary = await runSeed(payload)

    payload.logger.info('Development seed completed.')
    for (const [collection, totals] of summary.entries()) {
      payload.logger.info(
        `${collection}: ${totals.created} created, ${totals.updated} updated.`,
      )
    }
  } finally {
    await payload.destroy()
  }
}

await main()
