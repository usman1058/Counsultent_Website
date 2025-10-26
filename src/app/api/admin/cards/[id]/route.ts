import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next/auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

// Function to check if a column exists
async function columnExists(tableName: string, columnName: string) {
  try {
      const result = await db.$queryRaw(
        Prisma.sql`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ${Prisma.raw(tableName)} AND COLUMN_NAME = ${Prisma.raw(columnName)}`
      )
    return Array.isArray(result) && result.length > 0
  } catch (error) {
    console.log('Error checking column existence:', error)
    return false
  }
}

// Function to add a column if it doesn't exist
async function addColumnIfNotExists(tableName: string, columnName: string, columnDefinition: string) {
  try {
    const exists = await columnExists(tableName, columnName)
    if (!exists) {
          await db.$executeRaw(
            Prisma.sql`ALTER TABLE \`${Prisma.raw(tableName)}\` ADD COLUMN \`${Prisma.raw(columnName)}\` ${Prisma.raw(columnDefinition)}`
          )
      console.log(`Added ${columnName} column to ${tableName} table`)
      return true
    }
    return false
  } catch (error) {
    console.log(`Error adding ${columnName} column:`, error)
    return false
  }
}

// Function to check if a table exists
async function tableExists(tableName: string) {
  try {
      const result = await db.$queryRaw(
        Prisma.sql`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ${Prisma.raw(tableName)}`
      )
    return Array.isArray(result) && result.length > 0
  } catch (error) {
    console.log('Error checking table existence:', error)
    return false
  }
}

// Function to create a table if it doesn't exist
async function createTableIfNotExists(tableName: string, createStatement: string) {
  try {
    const exists = await tableExists(tableName)
    if (!exists) {
          await db.$executeRaw(Prisma.sql([createStatement], []))
      console.log(`Created ${tableName} table`)
      return true
    }
    return false
  } catch (error) {
    console.log(`Error creating ${tableName} table:`, error)
    return false
  }
}

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

    // Step 1: Ensure all required columns exist in the Card table
    console.log('Checking and adding missing columns to Card table...')
    const isActiveAdded = await addColumnIfNotExists('Card', 'isActive', 'BOOLEAN DEFAULT TRUE')
    const linkAdded = await addColumnIfNotExists('Card', 'link', 'VARCHAR(255)')
    
    // Step 2: Ensure CardBlock table exists
    console.log('Checking CardBlock table...')
    const cardBlockCreated = await createTableIfNotExists('CardBlock', `
      CREATE TABLE \`CardBlock\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`value\` TEXT NOT NULL,
        \`icon\` VARCHAR(255),
        \`cardId\` INT NOT NULL,
        \`createdAt\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`cardId\`) REFERENCES \`Card\`(\`id\`) ON DELETE CASCADE
      )
    `)

    // Step 3: Update the card with all fields
    console.log('Updating card with all fields...')
    const updateData: any = {
      title,
      description,
      imageUrl: imageUrl || null
    }

    // Add optional fields
    if (cardCategory !== undefined) updateData.cardCategory = cardCategory
    if (duration !== undefined) updateData.duration = duration
    if (location !== undefined) updateData.location = location
    if (intake !== undefined) updateData.intake = intake
    if (requirements !== undefined) updateData.requirements = requirements
    if (isActive !== undefined) updateData.isActive = isActive
    if (link !== undefined) updateData.link = link

    // Update the card
    const card = await db.card.update({
      where: { id: parseInt(id) },
      data: updateData
    })

    // Step 4: Update the category relationship
    console.log('Updating category relationship...')
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

    // Step 5: Update blocks if provided
    if (blocks !== undefined) {
      console.log('Updating blocks...')
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
        console.log('Error updating blocks:', error)
      }
    }

    // Step 6: Fetch the updated card to verify the update
    console.log('Fetching updated card to verify changes...')
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

    // Step 7: Check if isActive was actually updated
    const isActiveFieldExists = await columnExists('Card', 'isActive')
    const isActiveCurrentValue = isActiveFieldExists && updatedCard ? (updatedCard as any).isActive : 'N/A'

    console.log('Update verification:', {
      isActiveRequested: isActive,
      isActiveCurrentValue: isActiveCurrentValue,
      isActiveFieldExists: isActiveFieldExists
    })

    return NextResponse.json({ 
      message: 'Card updated successfully',
      card: updatedCard,
      debug: {
        isActiveRequested: isActive,
        isActiveCurrentValue: isActiveCurrentValue,
        isActiveFieldExists: isActiveFieldExists,
        cardFields: Object.keys(updatedCard || {}),
        schemaChanges: {
          isActiveAdded,
          linkAdded,
          cardBlockCreated
        }
      }
    })
  } catch (error) {
    console.error('Failed to update card:', error)
      let errorMessage = 'Unknown error';
      if (error instanceof Error) errorMessage = error.message;
      return NextResponse.json({ error: 'Failed to update card', details: errorMessage }, { status: 500 })
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
      let errorMessage = 'Unknown error';
      if (error instanceof Error) errorMessage = error.message;
      return NextResponse.json({ error: 'Failed to delete card', details: errorMessage }, { status: 500 })
  }
}