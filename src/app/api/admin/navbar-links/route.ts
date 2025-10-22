// app/api/admin/navbar-links/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Default navbar links
const defaultNavbarLinks = [
  { id: '1', label: 'Home', href: '/', isVisible: true, order: 0 },
  { id: '2', label: 'About', href: '/about', isVisible: true, order: 1 },
  { id: '3', label: 'Services', href: '/services', isVisible: true, order: 2 },
  { id: '4', label: 'Study Destinations', href: '/study-destinations', isVisible: true, order: 3 },
  { id: '5', label: 'Contact', href: '/contact', isVisible: true, order: 4 },
]

// In-memory storage for demo purposes
// In production, you'd store this in a database
let navbarLinks = [...defaultNavbarLinks]

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(navbarLinks)
  } catch (error) {
    console.error('Failed to fetch navbar links:', error)
    return NextResponse.json({ error: 'Failed to fetch navbar links' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { links } = body

    if (!Array.isArray(links)) {
      return NextResponse.json({ error: 'Links must be an array' }, { status: 400 })
    }

    // Validate each link
    for (const link of links) {
      if (!link.id || !link.label || !link.href) {
        return NextResponse.json({ error: 'Each link must have id, label, and href' }, { status: 400 })
      }
    }

    navbarLinks = links
    return NextResponse.json({ message: 'Navbar links updated successfully', links: navbarLinks })
  } catch (error) {
    console.error('Failed to update navbar links:', error)
    return NextResponse.json({ error: 'Failed to update navbar links' }, { status: 500 })
  }
}