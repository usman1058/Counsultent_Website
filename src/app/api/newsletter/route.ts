import { NextRequest, NextResponse } from 'next/server'
import * as z from 'zod'

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address')
})

// In a real application, you would save this to a database
// For now, we'll just simulate the subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = newsletterSchema.parse(body)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In a real app, you would save to database here:
    // await db.newsletter.create({
    //   data: {
    //     email: validatedData.email,
    //     subscribedAt: new Date()
    //   }
    // })
    
    console.log('Newsletter subscription:', validatedData.email)

    return NextResponse.json(
      { 
        message: 'Successfully subscribed to newsletter',
        email: validatedData.email
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    
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
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    )
  }
}