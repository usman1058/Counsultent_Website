// app/api/admin/settings/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET settings
export async function GET() {
  try {
    let settings = await db.siteSettings.findFirst({
      where: { id: 1 }
    })

    // If no settings exist, create default ones
    if (!settings) {
      settings = await db.siteSettings.create({
        data: {
          siteName: 'Study Abroad with Hadi',
          siteUrl: 'https://studyabroadwithhadi.info',
          contactEmail: 'info@studyabroadwithhadi.info',
          contactPhone: '+1-234-567-8900',
          address: '123 Education Street, Learning City, LC 12345',
          aboutContent: 'Welcome to Study Abroad with Hadi - Your trusted partner for international education and visa consulting.',
          metaTitle: 'Study Abroad with Hadi - Visa Consulting & International Education',
          metaDescription: 'Expert visa consulting services for students looking to study abroad. Personalized guidance for admissions, scholarships, and visa applications.',
          primaryColor: '#3b82f6',
          secondaryColor: '#6366f1',
          accentColor: '#f59e0b',
          adminName: 'Hadi',
          adminEmail: 'admin@studyabroadwithhadi.info',
          adminPhone: '+1-234-567-8900',
          adminTitle: 'Expert Visa Consultant',
          adminBio: 'With over 10 years of experience in international education consulting, I\'ve helped hundreds of students achieve their dream of studying abroad.',
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT/PATCH settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Process the data - convert empty strings to null
    const processedData = {
      siteName: body.siteName,
      siteUrl: body.siteUrl,
      logoUrl: body.logoUrl || null,
      faviconUrl: body.faviconUrl || null,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      address: body.address || null,
      aboutContent: body.aboutContent || null,
      metaTitle: body.metaTitle || null,
      metaDescription: body.metaDescription || null,
      primaryColor: body.primaryColor,
      secondaryColor: body.secondaryColor,
      accentColor: body.accentColor,
      adminName: body.adminName,
      adminEmail: body.adminEmail,
      adminPhone: body.adminPhone,
      adminTitle: body.adminTitle,
      adminBio: body.adminBio || null,
    }
    
    // Upsert settings
    const settings = await db.siteSettings.upsert({
      where: { id: 1 },
      update: processedData,
      create: {
        id: 1,
        ...processedData
      }
    })

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings
    })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}