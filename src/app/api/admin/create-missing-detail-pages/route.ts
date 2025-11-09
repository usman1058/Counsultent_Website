import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all cards that don't have a detail page
    const cardsWithoutDetailPage = await db.card.findMany({
      where: {
        detailPage: null
      }
    })

    console.log(`Found ${cardsWithoutDetailPage.length} cards without detail pages`)

    // Create detail pages for each card
    const createdDetailPages = await Promise.all(
      cardsWithoutDetailPage.map(card => 
        db.detailPage.create({
          cardId: card.id,
          content: `Detail page for ${card.title}`
        })
      )
    )

    console.log(`Created ${createdDetailPages.length} detail pages`)

    return NextResponse.json({ 
      success: true,
      created: createdDetailPages.length,
      message: `Created ${createdDetailPages.length} detail pages`
    })
  } catch (error) {
    console.error('Failed to create missing detail pages:', error)
    return NextResponse.json(
      { error: 'Failed to create missing detail pages' },
      { status: 500 }
    )
  }
}