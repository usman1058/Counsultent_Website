import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const entryId = parseInt(params.id)
    if (isNaN(entryId)) {
      return NextResponse.json(
        { error: 'Invalid entry ID' },
        { status: 400 }
      )
    }

    // Mark entry as winner
    const updatedEntry = await db.luckyDrawEntry.update({
      where: { id: entryId },
      data: { isWinner: true }
    })

    return NextResponse.json({
      message: 'Winner marked successfully',
      winner: updatedEntry
    })
  } catch (error) {
    console.error('Winner marking error:', error)
    return NextResponse.json(
      { error: 'Failed to mark winner' },
      { status: 500 }
    )
  }
}