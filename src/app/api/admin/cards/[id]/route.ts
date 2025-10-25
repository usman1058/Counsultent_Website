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

    // Update card
    const card = await db.card.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
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

    // Update blocks if provided
    if (blocks !== undefined) {
      // Delete existing blocks
      await db.cardBlock.deleteMany({
        where: { cardId: parseInt(id) }
      })
      
      // Create new blocks
      if (blocks.length > 0) {
        await db.cardBlock.createMany({
          data: blocks.map((block: any) => ({
            title: block.title,
            value: block.value,
            icon: block.icon || null,
            cardId: parseInt(id)
          }))
        })
      }
    }

    return NextResponse.json(card)
  } catch (error) {
    console.error('Failed to update card:', error)
    return NextResponse.json({ error: 'Failed to update card' }, { status: 500 })
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

    await db.card.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: 'Card deleted successfully' })
  } catch (error) {
    console.error('Failed to delete card:', error)
    return NextResponse.json({ error: 'Failed to delete card' }, { status: 500 })
  }
}