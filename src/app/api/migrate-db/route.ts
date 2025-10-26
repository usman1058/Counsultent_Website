import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const results = {
      messages: [] as string[],
      errors: [] as string[],
      schemaStatus: {
        cardTable: false,
        cardFields: {
          isActive: false,
          link: false
        },
        cardBlockTable: false
      }
    }

    // Check Card table structure
    try {
      const cardSchema = await db.$queryRaw`DESCRIBE \`Card\``
      if (Array.isArray(cardSchema)) {
        results.schemaStatus.cardTable = true
        results.schemaStatus.cardFields.isActive = cardSchema.some((col: any) => col.Field === 'isActive')
        results.schemaStatus.cardFields.link = cardSchema.some((col: any) => col.Field === 'link')
        results.messages.push('Card table exists with required fields')
      } else {
        results.errors.push('Failed to describe Card table')
      }
    } catch (error) {
      results.errors.push(`Error checking Card table: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Check CardBlock table
    try {
      const cardBlockSchema = await db.$queryRaw`DESCRIBE \`CardBlock\``
      if (Array.isArray(cardBlockSchema)) {
        results.schemaStatus.cardBlockTable = true
        results.messages.push('CardBlock table exists')
      } else {
        results.errors.push('CardBlock table does not exist')
      }
    } catch (error) {
      // Check if CardBlock table exists using a different method
      try {
        await db.$queryRaw`SELECT 1 FROM \`CardBlock\` LIMIT 1`
        results.schemaStatus.cardBlockTable = true
        results.messages.push('CardBlock table exists')
      } catch (e) {
        results.schemaStatus.cardBlockTable = false
        results.errors.push(`CardBlock table does not exist: ${e instanceof Error ? e.message : 'Unknown error'}`)
      }
    }

    // Generate a comprehensive status report
    const statusReport = {
      databaseReady: results.schemaStatus.cardTable && 
                   results.schemaStatus.cardFields.isActive && 
                   results.schemaStatus.cardFields.link &&
                   results.schemaStatus.cardBlockTable,
      issues: [] as string[]
    }

    if (!statusReport.databaseReady) {
      if (!results.schemaStatus.cardTable) {
        statusReport.issues.push('Card table is missing')
      }
      if (!results.schemaStatus.cardFields.isActive) {
        statusReport.issues.push('isActive field is missing from Card table')
      }
      if (!results.schemaStatus.cardFields.link) {
        statusReport.issues.push('link field is missing from Card table')
      }
      if (!results.schemaStatus.cardBlockTable) {
        statusReport.issues.push('CardBlock table is missing')
      }
    }

    return NextResponse.json({
      success: statusReport.databaseReady,
      messages: results.messages,
      errors: results.errors,
      schemaStatus: results.schemaStatus,
      statusReport: statusReport
    })
  } catch (error) {
    console.error('Migration check failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Migration check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}