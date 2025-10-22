import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    if (!status || !['new', 'contacted', 'resolved', 'closed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const contactId = parseInt(params.id)
    if (isNaN(contactId)) {
      return NextResponse.json({ error: 'Invalid contact ID' }, { status: 400 })
    }

    const updatedContact = await db.contactSubmission.update({
      where: { id: contactId },
      data: { status }
    })

    return NextResponse.json(updatedContact)
  } catch (error) {
    console.error('Failed to update contact status:', error)
    return NextResponse.json(
      { error: 'Failed to update contact status' },
      { status: 500 }
    )
  }
}