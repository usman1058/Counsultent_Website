import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'

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
    const { name, country, university, course, content, rating, imageUrl, isFeatured, isActive } = body

    if (!name || !country || !university || !course || !content) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    const testimonial = await db.testimonial.update({
      where: { id: parseInt(id) },
      data: {
        name,
        country,
        university,
        course,
        content,
        rating: rating || 5,
        imageUrl: imageUrl || null,
        isFeatured: isFeatured || false,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json(testimonial)
  } catch (error) {
    console.error('Failed to update testimonial:', error)
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 })
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

    await db.testimonial.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: 'Testimonial deleted successfully' })
  } catch (error) {
    console.error('Failed to delete testimonial:', error)
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 })
  }
}