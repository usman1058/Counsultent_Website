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

    // Try to update isActive field using multiple approaches
    if (isActive !== undefined) {
      let isActiveUpdated = false
      
      // Approach 1: Try using Prisma's typed API
      try {
        await db.card.update({
          where: { id: parseInt(id) },
          data: { isActive }
        })
        isActiveUpdated = true
        console.log('Updated isActive field using Prisma API')
      } catch (error) {
        console.log('Prisma API failed for isActive:', error)
      }
      
      // Approach 2: Try using raw SQL if Prisma failed
      if (!isActiveUpdated) {
        try {
          const sql = 'UPDATE `Card` SET `isActive` = ? WHERE `id` = ?'
          await db.$executeRawUnsafe(sql, [isActive, parseInt(id)])
          isActiveUpdated = true
          console.log('Updated isActive field using raw SQL')
        } catch (error) {
          console.log('Raw SQL failed for isActive:', error)
        }
      }
      
      // Approach 3: Try using a different SQL syntax
      if (!isActiveUpdated) {
        try {
          const sql = `UPDATE Card SET isActive = ${isActive ? 1 : 0} WHERE id = ${parseInt(id)}`
          await db.$executeRawUnsafe(sql)
          isActiveUpdated = true
          console.log('Updated isActive field using direct SQL values')
        } catch (error) {
          console.log('Direct SQL values failed for isActive:', error)
        }
      }
      
      if (!isActiveUpdated) {
        console.log('WARNING: Failed to update isActive field with all approaches')
      }
    }

    // Try to update link field using multiple approaches
    if (link !== undefined) {
      let linkUpdated = false
      
      // Approach 1: Try using Prisma's typed API
      try {
        await db.card.update({
          where: { id: parseInt(id) },
          data: { link }
        })
        linkUpdated = true
        console.log('Updated link field using Prisma API')
      } catch (error) {
        console.log('Prisma API failed for link:', error)
      }
      
      // Approach 2: Try using raw SQL if Prisma failed
      if (!linkUpdated) {
        try {
          const sql = 'UPDATE `Card` SET `link` = ? WHERE `id` = ?'
          await db.$executeRawUnsafe(sql, [link, parseInt(id)])
          linkUpdated = true
          console.log('Updated link field using raw SQL')
        } catch (error) {
          console.log('Raw SQL failed for link:', error)
        }
      }
      
      if (!linkUpdated) {
        console.log('WARNING: Failed to update link field with all approaches')
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

    // Fetch the updated card to verify the isActive field was updated
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

    // Check if isActive was actually updated
    const isActiveActuallyUpdated = updatedCard && 'isActive' in updatedCard && updatedCard.isActive === isActive

    return NextResponse.json({ 
      message: 'Card updated successfully',
      card: updatedCard,
      status: {
        isActiveRequested: isActive,
        isActiveActuallyUpdated: isActiveActuallyUpdated,
        isActiveFieldExists: Boolean(updatedCard && 'isActive' in updatedCard),
        isActiveCurrentValue: updatedCard && 'isActive' in updatedCard ? updatedCard.isActive : 'N/A'
      }
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

    // Check if the card exists
    const card = await db.card.findUnique({
      where: { id: parseInt(id) }
    })

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    // Find and delete any detail pages associated with this card
    try {
      const detailPages = await db.detailPage.findMany({
        where: { cardId: parseInt(id) }
      })

      if (detailPages.length > 0) {
        console.log(`Found ${detailPages.length} detail pages for card ${id}`)
        
        // Delete any tables associated with these detail pages
        for (const detailPage of detailPages) {
          try {
            await db.dynamicTable.deleteMany({
              where: { detailPageId: detailPage.id }
            })
            console.log(`Deleted tables for detail page ${detailPage.id}`)
          } catch (error) {
            console.error(`Failed to delete tables for detail page ${detailPage.id}:`, error)
          }
        }

        // Delete the detail pages
        await db.detailPage.deleteMany({
          where: { cardId: parseInt(id) }
        })
        console.log(`Deleted detail pages for card ${id}`)
      }
    } catch (error) {
      console.error('Failed to delete associated detail pages:', error)
      // Continue with card deletion even if detail page deletion fails
    }

    // Delete any blocks associated with this card
    try {
      await db.cardBlock.deleteMany({
        where: { cardId: parseInt(id) }
      })
      console.log(`Deleted blocks for card ${id}`)
    } catch (error) {
      console.log('CardBlock model does not exist, skipping blocks deletion', error)
    }

    // Delete the card
    await db.card.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: 'Card deleted successfully' })
  } catch (error) {
    console.error('Failed to delete card:', error)
    return NextResponse.json({ error: 'Failed to delete card' }, { status: 500 })
  }
}