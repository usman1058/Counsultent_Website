import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, MapPin, Users, Clock, BookOpen, Globe, DollarSign, CheckCircle, AlertCircle, Star, TrendingUp, Award, Shield, Plus, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/navbar'
import DynamicTableRenderer from '@/components/dynamic-table-renderer'

interface CardDetailPageProps {
  params: Promise<{ slug: string; cardId: string }>
}

interface CardData {
  id: number
  title: string
  description: string
  imageUrl: string | null
  cardCategory: string | null
  duration: string | null
  location: string | null
  intake: string | null
  requirements: string | null
  category: {
    id: number
    title: string
    description: string | null
    studyPage: {
      id: number
      title: string
      slug: string
    } | null
  } | null
}

interface DynamicTableData {
  id: number
  title: string
  description: string | null
  columns: any
  rows: any
  iconUrl: string | null
  createdAt: string
}


async function getCardDetail(slug: string, cardId: string): Promise<{ card: CardData | null; dynamicTables: DynamicTableData[] }> {
  try {
    const card = await db.card.findUnique({
      where: { 
        id: parseInt(cardId),
        category: {
          studyPage: {
            slug,
            isActive: true
          }
        }
      },
      include: {
        category: {
          include: {
            studyPage: {
              select: {
                id: true,
                title: true,
                slug: true
              }
            }
          }
        }
      }
    })

    if (!card) {
      return { card: null, dynamicTables: [] }
    }

    // Get detail page with dynamic tables
    const detailPage = await db.detailPage.findUnique({
      where: { cardId: parseInt(cardId) },
      include: {
        tables: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    const tables = detailPage?.tables || []
    
    // Filter out duplicates by keeping only the first occurrence of each title
    const uniqueTables = tables.filter((table, index, self) => 
      index === self.findIndex((t) => t.title === table.title)
    )
    
    console.log('Filtered tables:', uniqueTables.map(t => ({ id: t.id, title: t.title })))

    return { 
      card, 
      dynamicTables: uniqueTables
    }
  } catch (error) {
    console.error('Failed to fetch card detail:', error)
    return { card: null, dynamicTables: [] }
  }
}

export async function generateMetadata({ params }: CardDetailPageProps) {
  const { slug, cardId } = await params
  const { card } = await getCardDetail(slug, cardId)

  if (!card) {
    return {
      title: 'Program Not Found',
      description: 'The requested study program could not be found.'
    }
  }

  return {
    title: `${card.title} - ${card.category?.studyPage?.title || 'Study Program'}`,
    description: card.description,
    openGraph: {
      title: `${card.title} - ${card.category?.studyPage?.title || 'Study Program'}`,
      description: card.description,
      images: card.imageUrl ? [card.imageUrl] : [],
    },
  }
}

export default async function CardDetailPage({ params }: CardDetailPageProps) {
  const { slug, cardId } = await params
  const { card, dynamicTables } = await getCardDetail(slug, cardId)

  if (!card) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Back Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href={`/study/${slug}`}>
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {card.category?.studyPage?.title || 'Study Programs'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Program Header */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-white/20 hover:bg-white/30 text-white border-white/30">
                <BookOpen className="w-3 h-3 mr-1" />
                {card.category?.title || 'Program'}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{card.title}</h1>
              <p className="text-xl text-white/90 mb-6 leading-relaxed">{card.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <Clock className="w-6 h-6 mb-2" />
                  <div className="text-sm text-white/80">Duration</div>
                  <div className="font-semibold">{card.duration || '4 years'}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <MapPin className="w-6 h-6 mb-2" />
                  <div className="text-sm text-white/80">Location</div>
                  <div className="font-semibold">{card.location || 'Multiple campuses'}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <Users className="w-6 h-6 mb-2" />
                  <div className="text-sm text-white/80">Intake</div>
                  <div className="font-semibold">{card.intake || 'Fall & Spring'}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <Globe className="w-6 h-6 mb-2" />
                  <div className="text-sm text-white/80">Category</div>
                  <div className="font-semibold">{card.cardCategory || 'General'}</div>
                </div>
              </div>
            </div>

            {card.imageUrl && (
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Requirements Section */}
      {card.requirements && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">
                <AlertCircle className="w-3 h-3 mr-1" />
                Requirements
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Admission Requirements</h2>
            </div>
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-8">
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed">{card.requirements}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Dynamic Tables Section */}
      {dynamicTables && dynamicTables.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-200">
                <TrendingUp className="w-3 h-3 mr-1" />
                Detailed Information
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Comprehensive Details & Comparisons
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explore detailed information and comparisons to make an informed decision
              </p>
            </div>

            


            <div className="space-y-16">
              {dynamicTables.map((table, index) => (
                <div key={`table-${table.id}-${index}`} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-6">
                    {table.iconUrl && (
                      <img
                        src={table.iconUrl}
                        alt={table.title}
                        className="w-8 h-8 mr-3 rounded"
                      />
                    )}
                    <h3 className="text-2xl font-bold text-gray-900">{table.title}</h3>
                  </div>
                  <DynamicTableRenderer
                    key={`renderer-${table.id}`}
                    title={table.title}
                    description={table.description}
                    columns={table.columns}
                    rows={table.rows}
                    iconUrl={table.iconUrl}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Get personalized guidance and support for your study abroad application
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                Get Free Consultation
              </Button>
            </Link>
            <Link href={`/study/${slug}`}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Explore More Programs
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}