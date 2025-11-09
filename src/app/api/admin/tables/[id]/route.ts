import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, description, detailPageId, columns, rows, iconUrl } = body

    if (!title || !columns || !rows) {
      return NextResponse.json(
        { error: 'Title, columns, and rows are required' },
        { status: 400 }
      )
    }

    // Verify the table exists
    const currentTable = await db.dynamicTable.findUnique({
      where: { id: parseInt(id) }
    })

    if (!currentTable) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      )
    }

    // Check if we're changing to a different card
    const isChangingCard = currentTable.detailPageId !== parseInt(detailPageId)
    
    let finalDetailPageId = parseInt(detailPageId)

    if (isChangingCard) {
      // Try to find a detail page associated with this card
      let detailPage = await db.detailPage.findFirst({
        where: { cardId: finalDetailPageId }
      })

      // If no detail page exists for this card, create one
      if (!detailPage) {
        try {
          // Get the card to create a detail page for it
          const card = await db.card.findUnique({
            where: { id: finalDetailPageId }
          })

          if (!card) {
            return NextResponse.json(
              { error: 'Card not found' },
              { status: 404 }
            )
          }

          // Create a new detail page for the card
          detailPage = await db.detailPage.create({
            data: {
              cardId: finalDetailPageId,
              content: `Detail page for ${card.title}`
            }
          })

          console.log(`Created new detail page ${detailPage.id} for card ${card.id}`)
        } catch (error) {
          console.error('Failed to create detail page:', error)
          return NextResponse.json(
            { error: 'Failed to create detail page for the selected card' },
            { status: 500 }
          )
        }
      }

      // Use the detail page's ID (not the card ID)
      finalDetailPageId = detailPage.id
    }

    // Update the table with the final detail page ID
    const updatedTable = await db.dynamicTable.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description: description || null,
        detailPageId: finalDetailPageId,
        columns,
        rows,
        iconUrl: iconUrl || null
      },
      include: {
        detailPage: {
          include: {
            card: {
              include: {
                category: {
                  include: {
                    studyPage: true
                  }
                }
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedTable)
  } catch (error) {
    console.error('Failed to update table:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update table' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await db.dynamicTable.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete table:', error)
    return NextResponse.json(
      { error: 'Failed to delete table' },
      { status: 500 }
    )
  }
}
