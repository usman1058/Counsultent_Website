import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const results = {
      messages: [] as string[],
      errors: [] as string[]
    }

    // Function to check if a column exists
    const columnExists = async (tableName: string, columnName: string) => {
      try {
        const result = await db.$queryRaw`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = ? AND COLUMN_NAME = ?
        `, [tableName, columnName])
        return Array.isArray(result) && result.length > 0
      } catch (error) {
        return false
      }
    }

    // Function to check if a table exists
    const tableExists = async (tableName: string) => {
      try {
        const result = await db.$queryRaw`
          SELECT TABLE_NAME 
          FROM INFORMATION_SCHEMA.TABLES 
          WHERE TABLE_NAME = ?
        `, [tableName])
        return Array.isArray(result) && result.length > 0
      } catch (error) {
        return false
      }
    }

    // Add isActive field to Card table if it doesn't exist
    const isActiveExists = await columnExists('Card', 'isActive')
    if (!isActiveExists) {
      try {
        await db.$executeRaw`ALTER TABLE \`Card\` ADD COLUMN \`isActive\` BOOLEAN DEFAULT TRUE`
        results.messages.push('Added isActive field to Card table')
      } catch (error) {
        results.errors.push(`Failed to add isActive field: ${error.message}`)
      }
    } else {
      results.messages.push('isActive field already exists in Card table')
    }

    // Add link field to Card table if it doesn't exist
    const linkExists = await columnExists('Card', 'link')
    if (!linkExists) {
      try {
        await db.$executeRaw`ALTER TABLE \`Card\` ADD COLUMN \`link\` VARCHAR(255)`
        results.messages.push('Added link field to Card table')
      } catch (error) {
        results.errors.push(`Failed to add link field: ${error.message}`)
      }
    } else {
      results.messages.push('link field already exists in Card table')
    }

    // Create CardBlock table if it doesn't exist
    const cardBlockExists = await tableExists('CardBlock')
    if (!cardBlockExists) {
      try {
        await db.$executeRaw(`
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
        results.messages.push('Created CardBlock table')
      } catch (error) {
        results.errors.push(`Failed to create CardBlock table: ${error.message}`)
      }
    } else {
      results.messages.push('CardBlock table already exists')
    }

    // Check if CardBlock has the foreign key constraint
    try {
      const constraints = await db.$queryRaw`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = 'CardBlock' AND CONSTRAINT_NAME = 'CardBlock_ibfk_1'
      `
      if (!Array.isArray(constraints) || constraints.length === 0) {
        // Add foreign key constraint if it doesn't exist
        try {
          await db.$executeRaw`
            ALTER TABLE \`CardBlock\` 
            ADD CONSTRAINT \`CardBlock_ibfk_1\` 
            FOREIGN KEY (\`cardId\`) REFERENCES \`Card\`(\`id\`) ON DELETE CASCADE
          `
          results.messages.push('Added foreign key constraint to CardBlock table')
        } catch (error) {
          results.errors.push(`Failed to add foreign key constraint: ${error.message}`)
        }
      }
    } catch (error) {
      results.errors.push(`Failed to check foreign key constraint: ${error.message}`)
    }

    // Return the results
    if (results.errors.length > 0) {
      return NextResponse.json({ 
        success: false,
        messages: results.messages,
        errors: results.errors
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      messages: results.messages,
      errors: results.errors
    })
  } catch (error) {
    console.error('Migration failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Migration failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}