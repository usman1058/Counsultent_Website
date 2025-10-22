import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const detailPageId = searchParams.get('detailPageId')

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (detailPageId) {
      where.detailPageId = parseInt(detailPageId)
    }

    const [tables, totalCount] = await Promise.all([
      db.dynamicTable.findMany({
        where,
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
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit
      }),
      db.dynamicTable.count({ where })
    ])

    return NextResponse.json({
      tables,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Failed to fetch dynamic tables:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dynamic tables' },
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
    const { title, description, detailPageId, columns, rows, iconUrl } = body

    if (!title || !detailPageId || !columns || !rows) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate that the detail page exists
    const detailPage = await db.detailPage.findUnique({
      where: { id: parseInt(detailPageId) }
    })

    if (!detailPage) {
      return NextResponse.json(
        { error: 'Detail page not found' },
        { status: 404 }
      )
    }

    const table = await db.dynamicTable.create({
      data: {
        title,
        description,
        detailPageId: parseInt(detailPageId),
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

    return NextResponse.json(table, { status: 201 })
  } catch (error) {
    console.error('Failed to create dynamic table:', error)
    return NextResponse.json(
      { error: 'Failed to create dynamic table' },
      { status: 500 }
    )
  }
}