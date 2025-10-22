import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'
import * as z from 'zod'

const b2bSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  country: z.string().min(2, 'Please select or enter a country'),
  message: z.string().min(10, 'Message must be at least 10 characters')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = b2bSchema.parse(body)
    
    // Save to database
    const b2bSubmission = await db.b2BSubmission.create({
      data: {
        name: validatedData.name,
        company: validatedData.company,
        email: validatedData.email,
        phone: validatedData.phone,
        country: validatedData.country,
        message: validatedData.message
      }
    })

    return NextResponse.json(
      { 
        message: 'B2B form submitted successfully',
        id: b2bSubmission.id
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('B2B form error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit B2B form' },
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

    const b2bSubmissions = await db.b2BSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to 50 most recent
    })

    return NextResponse.json(b2bSubmissions)
  } catch (error) {
    console.error('Failed to fetch B2B submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch B2B submissions' },
      { status: 500 }
    )
  }
}