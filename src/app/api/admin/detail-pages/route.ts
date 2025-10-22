import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const cardId = searchParams.get('cardId')

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 })
    }

    // Check if card exists and get detail page
    const card = await db.card.findUnique({
      where: { id: parseInt(cardId) },
      include: {
        category: {
          include: {
            studyPage: true
          }
        }
      }
    })

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    // Get or create detail page
    let detailPage = await db.detailPage.findUnique({
      where: { cardId: parseInt(cardId) },
      include: {
        tables: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!detailPage) {
      detailPage = await db.detailPage.create({
        data: {
          cardId: parseInt(cardId),
          content: `Detailed information about ${card.title}`
        },
        include: {
          tables: {
            orderBy: { createdAt: 'asc' }
          }
        }
      })
    }

    return NextResponse.json(detailPage)
  } catch (error) {
    console.error('Failed to fetch detail page:', error)
    return NextResponse.json(
      { error: 'Failed to fetch detail page' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { cardId, title, description, columns, rows } = body

    if (!cardId || !title || !columns || !rows) {
      return NextResponse.json(
        { error: 'Card ID, title, columns, and rows are required' },
        { status: 400 }
      )
    }

    // Check if card exists
    const card = await db.card.findUnique({
      where: { id: parseInt(cardId) }
    })

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    // Get or create detail page
    let detailPage = await db.detailPage.findUnique({
      where: { cardId: parseInt(cardId) }
    })

    if (!detailPage) {
      detailPage = await db.detailPage.create({
        data: {
          cardId: parseInt(cardId),
          content: `Detailed information about ${card.title}`
        }
      })
    }

    // Create dynamic table
    const table = await db.dynamicTable.create({
      data: {
        title,
        description: description || null,
        detailPageId: detailPage.id,
        columns,
        rows
      }
    })

    return NextResponse.json(table, { status: 201 })
  } catch (error) {
    console.error('Failed to create table:', error)
    return NextResponse.json(
      { error: 'Failed to create table' },
      { status: 500 }
    )
  }
}