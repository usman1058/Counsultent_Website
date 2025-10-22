import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const categories = await db.category.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        studyPage: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },
        cards: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, studyPageId } = body

    if (!title || !studyPageId) {
      return NextResponse.json({ error: 'Title and study page are required' }, { status: 400 })
    }

    // Verify study page exists
    const studyPage = await db.studyPage.findUnique({
      where: { id: parseInt(studyPageId) }
    })

    if (!studyPage) {
      return NextResponse.json({ error: 'Study page not found' }, { status: 404 })
    }

    const category = await db.category.create({
      data: {
        title,
        description: description || null,
        studyPageId: parseInt(studyPageId)
      },
      include: {
        studyPage: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },
        cards: true
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Failed to create category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}