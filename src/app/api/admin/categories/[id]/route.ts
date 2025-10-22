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
    const { id } = await params
    
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

    const category = await db.category.update({
      where: { id: parseInt(id) },
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
    console.error('Failed to update category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete all cards in this category first
    await db.card.deleteMany({
      where: { categoryId: parseInt(id) }
    })

    // Delete the category
    await db.category.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Failed to delete category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}