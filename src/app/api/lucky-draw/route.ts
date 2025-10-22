import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'
import * as z from 'zod'

const luckyDrawSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  country: z.string().min(2, 'Please select or enter a country'),
  reason: z.string().min(20, 'Please tell us why you want to study abroad (at least 20 characters)')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = luckyDrawSchema.parse(body)
    
    // Check if email already exists
    const existingEntry = await db.luckyDrawEntry.findFirst({
      where: { email: validatedData.email }
    })
    
    if (existingEntry) {
      return NextResponse.json(
        { error: 'Email already registered for lucky draw' },
        { status: 409 }
      )
    }
    
    // Save to database
    const luckyDrawEntry = await db.luckyDrawEntry.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        country: validatedData.country,
        reason: validatedData.reason
      }
    })

    return NextResponse.json(
      { 
        message: 'Lucky draw entry submitted successfully',
        id: luckyDrawEntry.id
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Lucky draw entry error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors
        },
        { status: 400 }
      )
    }

    // Try to provide more specific error information
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Failed to submit lucky draw entry',
          details: error.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit lucky draw entry' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const entries = await db.luckyDrawEntry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to 100 most recent
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Failed to fetch lucky draw entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lucky draw entries' },
      { status: 500 }
    )
  }
}