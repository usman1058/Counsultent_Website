import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if CardBlock model exists
    let blocks = []
    try {
      blocks = await db.cardBlock.findMany({
        where: { cardId: parseInt(id) },
        orderBy: { id: 'asc' }
      })
    } catch (error) {
      console.log('CardBlock model does not exist, returning empty array')
      // CardBlock model doesn't exist, return empty array
    }

    return NextResponse.json(blocks)
  } catch (error) {
    console.error('Failed to fetch blocks:', error)
    return NextResponse.json({ error: 'Failed to fetch blocks' }, { status: 500 })
  }
}

export async function POST(
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
    const { title, value, icon } = body

    if (!title || !value) {
      return NextResponse.json({ error: 'Title and value are required' }, { status: 400 })
    }

    // Check if CardBlock model exists
    let block = null
    try {
      block = await db.cardBlock.create({
        data: {
          title,
          value,
          icon: icon || null,
          cardId: parseInt(id)
        }
      })
    } catch (error) {
      console.log('CardBlock model does not exist, cannot create block')
      return NextResponse.json({ error: 'CardBlock model does not exist in production database' }, { status: 400 })
    }

    return NextResponse.json(block)
  } catch (error) {
    console.error('Failed to create block:', error)
    return NextResponse.json({ error: 'Failed to create block' }, { status: 500 })
  }
}