import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const studyPages = await db.studyPage.findMany({
      where: { isActive: { not: false } },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        bannerUrl: true,
        seoTitle: true,
        seoDescription: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            categories: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(studyPages)
  } catch (error) {
    console.error('Failed to fetch study pages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch study pages' },
      { status: 500 }
    )
  }
}