import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import StudyPageClient from '@/components/study-page-client'
import Navbar from '@/components/navbar'

interface StudyPageData {
  id: number
  title: string
  slug: string
  description: string
  bannerUrl: string | null
  seoTitle: string | null
  seoDescription: string | null
  isActive: boolean
  categories: {
    id: number
    title: string
    description: string | null
    cards: {
      id: number
      title: string
      description: string
      imageUrl: string | null
      cardCategory: string | null
      duration: string | null
      location: string | null
      intake: string | null
      requirements: string | null
    }[]
  }[]
}

async function getStudyPage(slug: string): Promise<StudyPageData | null> {
  try {
    const studyPage = await db.studyPage.findUnique({
      where: { 
        slug,
        isActive: true 
      },
      include: {
        categories: {
          include: {
            cards: {
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    return studyPage
  } catch (error) {
    console.error('Failed to fetch study page:', error)
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const studyPage = await getStudyPage(slug)
  
  if (!studyPage) {
    return {
      title: 'Page Not Found',
      description: 'The requested study page could not be found.'
    }
  }

  return {
    title: studyPage.seoTitle || studyPage.title,
    description: studyPage.seoDescription || studyPage.description,
    openGraph: {
      title: studyPage.seoTitle || studyPage.title,
      description: studyPage.seoDescription || studyPage.description,
      images: studyPage.bannerUrl ? [studyPage.bannerUrl] : [],
    },
  }
}

export default async function StudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const studyPage = await getStudyPage(slug)

  if (!studyPage) {
    notFound()
  }

  // Get country-specific data
  const getCountryData = (title: string) => {
    const countryData: Record<string, { 
      flag: string; 
      highlights: string[]; 
      stats: { universities: string; students: string; employment: string };
      benefits: string[];
      color: string;
    }> = {
      'Study in Italy': {
        flag: '🇮🇹',
        highlights: ['Rich Culture', 'Affordable Education', 'Scholarships Available'],
        stats: { universities: '50+', students: '100K+', employment: '85%' },
        benefits: ['Historical Universities', 'Art & Design Programs', 'Mediterranean Lifestyle'],
        color: 'from-green-400 to-green-600'
      },
      'Study in Canada': {
        flag: '🇨🇦',
        highlights: ['Post-Grad Work', 'Quality Education', 'Immigration Pathway'],
        stats: { universities: '100+', students: '200K+', employment: '90%' },
        benefits: ['Co-op Programs', 'Post-Graduation Work Permit', 'Pathway to PR'],
        color: 'from-red-400 to-red-600'
      },
      'Study in UK': {
        flag: '🇬🇧',
        highlights: ['Prestigious Universities', 'Shorter Programs', 'Global Recognition'],
        stats: { universities: '150+', students: '500K+', employment: '92%' },
        benefits: ['3-Year Bachelor Programs', '1-Year Master Programs', 'Global Business Hub'],
        color: 'from-blue-400 to-blue-600'
      },
      'Study in USA': {
        flag: '🇺🇸',
        highlights: ['Research Opportunities', 'Diverse Programs', 'Career Advancement'],
        stats: { universities: '200+', students: '1M+', employment: '88%' },
        benefits: ['World-Class Research', 'Diverse Campus Life', 'Silicon Valley Connections'],
        color: 'from-purple-400 to-purple-600'
      },
      'Study in Australia': {
        flag: '🇦🇺',
        highlights: ['Work Rights', 'High Quality Life', 'Research Focus'],
        stats: { universities: '40+', students: '300K+', employment: '87%' },
        benefits: ['Work While Studying', 'High Standard of Living', 'Research Excellence'],
        color: 'from-yellow-400 to-yellow-600'
      },
      'Study in Germany': {
        flag: '🇩🇪',
        highlights: ['No Tuition Fees', 'Engineering Excellence', 'Research Opportunities'],
        stats: { universities: '300+', students: '400K+', employment: '91%' },
        benefits: ['Free Tuition', 'Strong Engineering', 'Central European Location'],
        color: 'from-gray-600 to-gray-800'
      },
      'Study in France': {
        flag: '🇫🇷',
        highlights: ['Art & Culture', 'Business Schools', 'Language Learning'],
        stats: { universities: '80+', students: '250K+', employment: '86%' },
        benefits: ['Fashion & Luxury Brands', 'Culinary Arts', 'EU Business Center'],
        color: 'from-indigo-400 to-indigo-600'
      },
      'Study in Spain': {
        flag: '🇪🇸',
        highlights: ['Warm Climate', 'Affordable Living', 'Tourism & Hospitality'],
        stats: { universities: '60+', students: '150K+', employment: '84%' },
        benefits: ['Affordable Living', 'Tourism Industry', 'Warm Climate'],
        color: 'from-orange-400 to-orange-600'
      }
    }
    return countryData[title] || {
      flag: '🌍',
      highlights: ['Quality Education', 'International Experience', 'Career Opportunities'],
      stats: { universities: '50+', students: '100K+', employment: '85%' },
      benefits: ['Quality Education', 'International Environment', 'Career Opportunities'],
      color: 'from-primary to-primary/80'
    }
  }

  const countryData = getCountryData(studyPage.title)

  return (
    <div className="min-h-screen">
      <Navbar />
      <StudyPageClient studyPage={studyPage} countryData={countryData} />
    </div>
  )
}