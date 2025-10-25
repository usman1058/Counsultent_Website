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
    const categoryId = searchParams.get('categoryId')

    const where: any = {}
    if (categoryId) {
      where.categoryId = parseInt(categoryId)
    }

    const cards = await db.card.findMany({
      where,
      include: {
        category: {
          include: {
            studyPage: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(cards)
  } catch (error) {
    console.error('Failed to fetch cards:', error)
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      title, 
      description, 
      imageUrl, 
      categoryId,
      cardCategory,
      duration,
      location,
      intake,
      requirements,
      isActive,
      link,
      blocks
    } = body

    if (!title || !description || !categoryId) {
      return NextResponse.json({ error: 'Title, description, and category are required' }, { status: 400 })
    }

    // Verify category exists
    const category = await db.category.findUnique({
      where: { id: parseInt(categoryId) }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Create card with new fields
    const card = await db.card.create({
      data: {
        title,
        description, // Now JSON
        imageUrl: imageUrl || null,
        categoryId: parseInt(categoryId),
        cardCategory: cardCategory || null,
        duration: duration || null,
        location: location || null,
        intake: intake || null,
        requirements: requirements || null,
        isActive: isActive !== undefined ? isActive : true,
        link: link || null
      }
    })

    // Create blocks if provided
    if (blocks && blocks.length > 0) {
      await db.cardBlock.createMany({
        data: blocks.map((block: any) => ({
          title: block.title,
          value: block.value,
          icon: block.icon || null,
          cardId: card.id
        }))
      })
    }

    return NextResponse.json(card)
  } catch (error) {
    console.error('Failed to create card:', error)
    return NextResponse.json({ error: 'Failed to create card' }, { status: 500 })
  }
}