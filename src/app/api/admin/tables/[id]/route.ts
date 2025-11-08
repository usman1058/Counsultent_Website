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

    // First, get the current table to ensure it exists
    const currentTable = await db.dynamicTable.findUnique({
      where: { id: parseInt(id) }
    })

    if (!currentTable) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      )
    }

    // Check if the detailPageId is changing
    const isChangingDetailPage = currentTable.detailPageId !== detailPageId

    // If the detailPageId is changing, we need to move the table to a different detail page
    if (isChangingDetailPage) {
      // Verify that the new detail page exists
      const newDetailPage = await db.detailPage.findUnique({
        where: { id: parseInt(detailPageId) }
      })

      if (!newDetailPage) {
        return NextResponse.json(
          { error: 'New detail page not found' },
          { status: 404 }
        )
      }

      console.log(`Moving table from detailPage ${currentTable.detailPageId} to detailPage ${detailPageId}`)
    }

    // Update the table
    const updatedTable = await db.dynamicTable.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description: description || null,
        detailPageId: parseInt(detailPageId), // This will move the table to a different detail page
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

    // Log the update for debugging
    console.log('Table updated successfully:', updatedTable)

    return NextResponse.json(updatedTable)
  } catch (error) {
    console.error('Failed to update table:', error)
    return NextResponse.json(
      { error: 'Failed to update table' },
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