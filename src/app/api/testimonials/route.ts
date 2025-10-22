import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const testimonials = await db.testimonial.findMany({
      where: { isActive: { not: false } },
      select: {
        id: true,
        name: true,
        country: true,
        university: true,
        course: true,
        rating: true,
        content: true,
        imageUrl: true,
        isActive: true,
        isFeatured: true,
        createdAt: true,
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(testimonials)
  } catch (error) {
    console.error('Failed to fetch testimonials:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    )
  }
}