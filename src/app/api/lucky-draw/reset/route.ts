import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Reset all winners
    const result = await db.luckyDrawEntry.updateMany({
      where: { isWinner: true },
      data: { isWinner: false }
    })

    return NextResponse.json({
      message: 'Lucky draw reset successfully',
      resetCount: result.count
    })
  } catch (error) {
    console.error('Lucky draw reset error:', error)
    return NextResponse.json(
      { error: 'Failed to reset lucky draw' },
      { status: 500 }
    )
  }
}