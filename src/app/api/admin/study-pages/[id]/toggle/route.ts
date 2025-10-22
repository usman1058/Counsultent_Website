import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'

export async function PATCH(
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
    const { isActive } = body

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive must be a boolean' }, { status: 400 })
    }

    const studyPage = await db.studyPage.update({
      where: { id: parseInt(id) },
      data: { isActive }
    })

    return NextResponse.json(studyPage)
  } catch (error) {
    console.error('Failed to toggle study page:', error)
    return NextResponse.json({ error: 'Failed to toggle study page' }, { status: 500 })
  }
}