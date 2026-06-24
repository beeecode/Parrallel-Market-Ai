import type { CollectionAfterChangeHook } from 'payload'

import { relationID } from '../lib/auth'
import { collectionSlugs } from '../lib/collectionSlugs'

export const updateConversationMetadata: CollectionAfterChangeHook = async ({
  context,
  doc,
  req,
}) => {
  if (context.skipConversationMetadata) {
    return doc
  }

  const conversationID = relationID(doc.conversation)
  if (conversationID == null) {
    return doc
  }

  const count = await req.payload.count({
    collection: collectionSlugs.messages,
    overrideAccess: true,
    req,
    where: {
      conversation: {
        equals: conversationID,
      },
    },
  })

  await req.payload.update({
    collection: collectionSlugs.conversations,
    id: conversationID,
    context: {
      skipConversationMetadata: true,
    },
    data: {
      lastMessageAt: doc.sentAt ?? new Date().toISOString(),
      messageCount: count.totalDocs,
    },
    overrideAccess: true,
    req,
  })

  return doc
}
