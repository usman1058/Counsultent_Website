import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get counts
    const contactsCount = await db.contactSubmission.count()
    const b2bCount = await db.b2BSubmission.count()
    const luckyDrawCount = await db.luckyDrawEntry.count()
    const studyPagesCount = await db.studyPage.count({
      where: { isActive: { not: false } }
    })

    // Get recent contacts
    const recentContacts = await db.contactSubmission.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        purpose: true,
        createdAt: true
      }
    })

    // Get recent B2B requests
    const recentB2B = await db.b2BSubmission.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        company: true,
        country: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      contacts: contactsCount,
      b2bRequests: b2bCount,
      luckyDrawEntries: luckyDrawCount,
      studyPages: studyPagesCount,
      recentContacts,
      recentB2B
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}