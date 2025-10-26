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

    // First, update the basic fields that definitely exist
    const basicUpdateData: any = {
      title,
      description,
      imageUrl: imageUrl || null
    }

    // Add optional fields that might exist
    try {
      if (cardCategory !== undefined) basicUpdateData.cardCategory = cardCategory
      if (duration !== undefined) basicUpdateData.duration = duration
      if (location !== undefined) basicUpdateData.location = location
      if (intake !== undefined) basicUpdateData.intake = intake
      if (requirements !== undefined) basicUpdateData.requirements = requirements
    } catch (error) {
      console.log('Some optional fields may not exist:', error)
    }

    // Update the card with basic fields
    const card = await db.card.update({
      where: { id: parseInt(id) },
      data: basicUpdateData
    })

    // Update the category relationship
    try {
      await db.card.update({
        where: { id: parseInt(id) },
        data: {
          category: {
            connect: { id: parseInt(categoryId) }
          }
        }
      })
    } catch (error) {
      console.log('Failed to update category relationship:', error)
    }

    // Try to update isActive field using raw SQL
    if (isActive !== undefined) {
      try {
        await db.$executeRaw`UPDATE \`Card\` SET \`isActive\` = ? WHERE \`id\` = ?`, [isActive, parseInt(id)])
        console.log('Updated isActive field using raw SQL')
      } catch (error) {
        console.log('Failed to update isActive field:', error)
      }
    }

    // Try to update link field using raw SQL
    if (link !== undefined) {
      try {
        await db.$executeRaw`UPDATE \`Card\` SET \`link\` = ? WHERE \`id\` = ?`, [link, parseInt(id)])
        console.log('Updated link field using raw SQL')
      } catch (error) {
        console.log('Failed to update link field:', error)
      }
    }

    // Update blocks if provided and if CardBlock model exists
    if (blocks !== undefined) {
      try {
        // Delete existing blocks
        await db.cardBlock.deleteMany({
          where: { cardId: parseInt(id) }
        })
        
        // Create new blocks
        if (Array.isArray(blocks) && blocks.length > 0) {
          await db.cardBlock.createMany({
            data: blocks.map((block: any) => ({
              title: block.title,
              value: block.value,
              icon: block.icon || null,
              cardId: parseInt(id)
            }))
          })
        }
      } catch (error) {
        console.log('CardBlock model does not exist, skipping blocks update', error)
      }
    }

    // Fetch the updated card to return current state
    const updatedCard = await db.card.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: {
          include: {
            studyPage: true
          }
        }
      }
    })

    return NextResponse.json({ 
      message: 'Card updated successfully',
      card: updatedCard 
    })
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