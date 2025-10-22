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
    const { title, slug, description, bannerUrl, seoTitle, seoDescription, isActive } = body

    if (!title || !slug || !description) {
      return NextResponse.json({ error: 'Title, slug, and description are required' }, { status: 400 })
    }

    // Check if slug already exists (excluding current page)
    const existingPage = await db.studyPage.findFirst({
      where: { 
        slug,
        id: { not: parseInt(id) }
      }
    })

    if (existingPage) {
      return NextResponse.json({ error: 'A study page with this slug already exists' }, { status: 400 })
    }

    const studyPage = await db.studyPage.update({
      where: { id: parseInt(id) },
      data: {
        title,
        slug,
        description,
        bannerUrl: bannerUrl || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json(studyPage)
  } catch (error) {
    console.error('Failed to update study page:', error)
    return NextResponse.json({ error: 'Failed to update study page' }, { status: 500 })
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

    // Delete categories and cards first (due to foreign key constraints)
    const categories = await db.category.findMany({
      where: { studyPageId: parseInt(id) },
      include: { cards: true }
    })

    for (const category of categories) {
      // Delete all cards in this category
      await db.card.deleteMany({
        where: { categoryId: category.id }
      })
    }

    // Delete all categories
    await db.category.deleteMany({
      where: { studyPageId: parseInt(id) }
    })

    // Delete the study page
    await db.studyPage.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: 'Study page deleted successfully' })
  } catch (error) {
    console.error('Failed to delete study page:', error)
    return NextResponse.json({ error: 'Failed to delete study page' }, { status: 500 })
  }
}