import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const table = await db.dynamicTable.findUnique({
      where: { id: parseInt(params.id) },
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

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 })
    }

    return NextResponse.json(table)
  } catch (error) {
    console.error('Failed to fetch dynamic table:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dynamic table' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, columns, rows, iconUrl } = body

    if (!title || !columns || !rows) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const table = await db.dynamicTable.update({
      where: { id: parseInt(params.id) },
      data: {
        title,
        description,
        columns,
        rows,
        iconUrl
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

    return NextResponse.json(table)
  } catch (error) {
    console.error('Failed to update dynamic table:', error)
    return NextResponse.json(
      { error: 'Failed to update dynamic table' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await db.dynamicTable.delete({
      where: { id: parseInt(params.id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete dynamic table:', error)
    return NextResponse.json(
      { error: 'Failed to delete dynamic table' },
      { status: 500 }
    )
  }
}