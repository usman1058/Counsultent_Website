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
    const { isFeatured } = body

    const testimonialId = parseInt(params.id)
    if (isNaN(testimonialId)) {
      return NextResponse.json({ error: 'Invalid testimonial ID' }, { status: 400 })
    }

    const updatedTestimonial = await db.testimonial.update({
      where: { id: testimonialId },
      data: { isFeatured }
    })

    return NextResponse.json(updatedTestimonial)
  } catch (error) {
    console.error('Failed to update testimonial featured status:', error)
    return NextResponse.json(
      { error: 'Failed to update testimonial featured status' },
      { status: 500 }
    )
  }
}