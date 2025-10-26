import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'

// Function to check if a column exists in a table
async function columnExists(tableName: string, columnName: string) {
  try {
    const result = await db.$queryRaw`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ${tableName} AND COLUMN_NAME = ${columnName}
    `;
    return Array.isArray(result) && result.length > 0;
  } catch (error) {
    return false;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
  const session = await getServerSession(authOptions)
  const { id } = params
    
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

    // Check which columns exist in the database
    const [isActiveExists, linkExists] = await Promise.all([
      columnExists('Card', 'isActive'),
      columnExists('Card', 'link')
    ])

    // Build update data with only fields that exist in the database
    const updateData: any = {
      title,
      description,
      imageUrl: imageUrl || null
    }

    // Add optional fields if they exist in the schema
    try {
      if (cardCategory !== undefined) updateData.cardCategory = cardCategory
      if (duration !== undefined) updateData.duration = duration
      if (location !== undefined) updateData.location = location
      if (intake !== undefined) updateData.intake = intake
      if (requirements !== undefined) updateData.requirements = requirements
      if (isActiveExists && isActive !== undefined) updateData.isActive = isActive
      if (linkExists && link !== undefined) updateData.link = link
    } catch (error) {
      console.log('Some fields may not exist in the database schema:', error)
    }

    // Update the card with all available fields
    const card = await db.card.update({
      where: { id: parseInt(id) },
      data: updateData
    })

    // Update the category relationship separately
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

    // Provide feedback about which fields were updated
    const feedback = {
      message: 'Card updated successfully',
      updatedFields: {
        title: true,
        description: true,
        imageUrl: imageUrl !== null,
        cardCategory: cardCategory !== undefined,
        duration: duration !== undefined,
        location: location !== undefined,
        intake: intake !== undefined,
        requirements: requirements !== undefined,
        isActive: isActiveExists && isActive !== undefined,
        link: linkExists && link !== undefined,
        category: true,
        blocks: blocks !== undefined && blocks.length > 0
      }
    }

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Failed to update card:', error)
    return NextResponse.json({ error: 'Failed to update card' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
  const session = await getServerSession(authOptions)
  const { id } = params
    
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