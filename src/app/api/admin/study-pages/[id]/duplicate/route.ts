import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the original study page with its categories and cards
    const originalPage = await db.studyPage.findUnique({
      where: { id: parseInt(id) },
      include: {
        categories: {
          include: {
            cards: true
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!originalPage) {
      return NextResponse.json({ error: 'Study page not found' }, { status: 404 })
    }

    // Create a new slug
    let newSlug = `${originalPage.slug}-copy`
    let counter = 1
    
    // Find an available slug
    while (await db.studyPage.findUnique({ where: { slug: newSlug } })) {
      newSlug = `${originalPage.slug}-copy-${counter}`
      counter++
    }

    // Create the duplicated study page
    const duplicatedPage = await db.studyPage.create({
      data: {
        title: `${originalPage.title} (Copy)`,
        slug: newSlug,
        description: originalPage.description,
        bannerUrl: originalPage.bannerUrl,
        seoTitle: originalPage.seoTitle ? `${originalPage.seoTitle} (Copy)` : null,
        seoDescription: originalPage.seoDescription,
        isActive: false // Duplicated pages start as inactive
      }
    })

    // Duplicate categories and cards
    for (const category of originalPage.categories) {
      const duplicatedCategory = await db.category.create({
        data: {
          title: category.title,
          description: category.description,
          studyPageId: duplicatedPage.id
        }
      })

      // Duplicate cards in this category
      for (const card of category.cards) {
        await db.card.create({
          data: {
            title: card.title,
            description: card.description,
            imageUrl: card.imageUrl,
            categoryId: duplicatedCategory.id
          }
        })
      }
    }

    return NextResponse.json(duplicatedPage)
  } catch (error) {
    console.error('Failed to duplicate study page:', error)
    return NextResponse.json({ error: 'Failed to duplicate study page' }, { status: 500 })
  }
}