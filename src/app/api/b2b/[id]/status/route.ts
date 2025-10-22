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

    if (!status || !['new', 'reviewed', 'interested', 'partnered', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const submissionId = parseInt(params.id)
    if (isNaN(submissionId)) {
      return NextResponse.json({ error: 'Invalid submission ID' }, { status: 400 })
    }

    const updatedSubmission = await db.b2BSubmission.update({
      where: { id: submissionId },
      data: { status }
    })

    return NextResponse.json(updatedSubmission)
  } catch (error) {
    console.error('Failed to update B2B submission status:', error)
    return NextResponse.json(
      { error: 'Failed to update submission status' },
      { status: 500 }
    )
  }
}