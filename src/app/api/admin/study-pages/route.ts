import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const studyPages = await db.studyPage.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        bannerUrl: true,
        seoTitle: true,
        seoDescription: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            categories: true // ✅ only categories, since cards are nested deeper
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(studyPages)
  } catch (error) {
    console.error('Failed to fetch study pages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch study pages' },
      { status: 500 }
    )
  }
}

// POST - Create a new study page
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, slug, description, bannerUrl, seoTitle, seoDescription, isActive } = body

    // Validate required fields
    if (!title || !slug || !description) {
      return NextResponse.json(
        { error: 'Title, slug, and description are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingPage = await db.studyPage.findUnique({
      where: { slug }
    })

    if (existingPage) {
      return NextResponse.json(
        { error: 'A study page with this slug already exists' },
        { status: 409 }
      )
    }

    const studyPage = await db.studyPage.create({
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

    return NextResponse.json(studyPage, { status: 201 })
  } catch (error) {
    console.error('Failed to create study page:', error)
    return NextResponse.json(
      { error: 'Failed to create study page' },
      { status: 500 }
    )
  }
}

// DELETE - Delete all study pages
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete all study pages
    await db.studyPage.deleteMany({})

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete study pages:', error)
    return NextResponse.json(
      { error: 'Failed to delete study pages' },
      { status: 500 }
    )
  }
}