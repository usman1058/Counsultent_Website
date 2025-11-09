// utils/detailPage.ts

import { db } from '@/lib/db'

export async function ensureDetailPageExists(cardId: number) {
  // Check if detail page already exists
  let detailPage = await db.detailPage.findUnique({
    where: { cardId }
  })

  // If it doesn't exist, create it
  if (!detailPage) {
    const card = await db.card.findUnique({
      where: { id: cardId }
    })

    if (!card) {
      throw new Error('Card not found')
    }

    detailPage = await db.detailPage.create({
      cardId,
      content: `Detail page for ${card.title}`
    })

    console.log(`Created new detail page ${detailPage.id} for card ${card.id}`)
  }

  return detailPage
}