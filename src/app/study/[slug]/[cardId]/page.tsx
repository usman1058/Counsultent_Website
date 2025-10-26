// study/[slug]/[cardId]/page.tsx
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, MapPin, Users, Clock, BookOpen, Globe, DollarSign, CheckCircle, AlertCircle, Star, TrendingUp, Award, Shield, Plus, Edit, Trash2, Info, ToggleLeft, ToggleRight, ExternalLink, Check } from 'lucide-react'
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
  isActive: boolean
  link: string | null
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

interface CardBlockData {
  id: number
  title: string
  value: string
  icon: string | null
}

async function getCardDetail(slug: string, cardId: string): Promise<{
  card: CardData | null;
  dynamicTables: DynamicTableData[];
  blocks: CardBlockData[];
}> {
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
      return { card: null, dynamicTables: [], blocks: [] }
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

    // Get blocks for this card with error handling
    let blocks: CardBlockData[] = []
    try {
      blocks = await db.cardBlock.findMany({
        where: { cardId: parseInt(cardId) },
        orderBy: { id: 'asc' }
      })
    } catch (error) {
      console.log('CardBlock model does not exist in database, returning empty blocks array')
      // CardBlock model doesn't exist, return empty array
      blocks = []
    }

    return {
      card,
      dynamicTables: uniqueTables,
      blocks
    }
  } catch (error) {
    console.error('Failed to fetch card detail:', error)
    return { card: null, dynamicTables: [], blocks: [] }
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
    description: typeof card.description === 'string' ? card.description : JSON.stringify(card.description),
    openGraph: {
      title: `${card.title} - ${card.category?.studyPage?.title || 'Study Program'}`,
      description: typeof card.description === 'string' ? card.description : JSON.stringify(card.description),
      images: card.imageUrl ? [card.imageUrl] : [],
    },
  }
}

// Function to render Font Awesome icons
const renderIcon = (iconClass: string) => {
  if (!iconClass) return null

  // Check if it's a Font Awesome class
  if (iconClass.includes('fa-') || iconClass.includes('fas ') || iconClass.includes('far ')) {
    return <i className={`${iconClass} text-2xl mr-3`}></i>
  }

  // Fallback to regular image if it's a URL
  return <img src={iconClass} alt="icon" className="w-8 h-8 mr-3" />
}

// Function to format requirements as a list
const formatRequirements = (requirements: string) => {
  if (!requirements) return null;

  // Split by bullet points, numbers, or line breaks
  const bulletPoints = requirements.split(/\n|\* |- |\d+\. /).filter(item => item.trim() !== '');

  if (bulletPoints.length > 1) {
    return (
      <ul className="space-y-3">
        {bulletPoints.map((point, index) => (
          <li key={index} className="flex items-start">
            <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{point}</span>
          </li>
        ))}
      </ul>
    );
  }

  // If no bullet points, split by sentences
  const sentences = requirements.split('. ').filter(s => s.trim() !== '');

  if (sentences.length > 1) {
    return (
      <ul className="space-y-3">
        {sentences.map((sentence, index) => (
          <li key={index} className="flex items-start">
            <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{sentence}{index < sentences.length - 1 ? '.' : ''}</span>
          </li>
        ))}
      </ul>
    );
  }

  // Fallback to paragraph
  return <p className="text-gray-700 leading-relaxed">{requirements}</p>;
};

export default async function CardDetailPage({ params }: CardDetailPageProps) {
  const { slug, cardId } = await params
  const { card, dynamicTables, blocks } = await getCardDetail(slug, cardId)

  if (!card) {
    notFound()
  }

  const renderStructuredDescription = (description: string) => {
    try {
      const parsedDescription = JSON.parse(description)

      return parsedDescription.map((item: any, index: number) => {
        if (item.type === 'heading') {
          return <h2 key={index} className="text-3xl font-bold mt-6 mb-4 text-white">{item.content}</h2>
        } else if (item.type === 'paragraph') {
          return <p key={index} className="text-xl text-blue-100 mb-6 leading-relaxed">{item.content}</p>
        } else if (item.type === 'list' && Array.isArray(item.items)) {
          return (
            <ul key={index} className="list-disc pl-6 text-xl text-blue-100 mb-6 space-y-2">
              {item.items.map((listItem: string, i: number) => (
                <li key={i} className="leading-relaxed">{listItem}</li>
              ))}
            </ul>
          )
        }
        return null
      })
    } catch (e) {
      return <p className="text-xl text-blue-100 leading-relaxed">{description}</p>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />



      {/* Program Header with Status Badge */}
      <div className={`bg-gradient-to-r ${card.isActive ? 'from-blue-600 to-indigo-700' : 'from-gray-700 to-gray-900'} text-white relative overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>




        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="mb-8">
            <Link href={`/study/${slug}`}>
              <Button variant="outline" className="mb-4 border-gray-300 text-gray-700 hover:bg-gray-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {card.category?.studyPage?.title || 'Study Programs'}
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>

              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-4 py-2 rounded-full text-sm font-medium">
                  <BookOpen className="w-4 h-4 mr-2" />
                  {card.category?.title || 'Program'}
                </Badge>
                {card.cardCategory && (
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-4 py-2 rounded-full text-sm font-medium">
                    <Star className="w-4 h-4 mr-2" />
                    {card.cardCategory}
                  </Badge>
                )}
                <Badge className={`px-4 py-2 rounded-full text-sm font-medium ${card.isActive
                    ? 'bg-green-500/80 hover:bg-green-500 text-white border-green-400'
                    : 'bg-red-500/80 hover:bg-red-500 text-white border-red-400'
                  }`}>
                  {card.isActive ? (
                    <div className="flex items-center">
                      <Check className="w-4 h-4 mr-2" />
                      Active
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Inactive
                    </div>
                  )}
                </Badge>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
                {card.title}
              </h1>

              <div className="mb-8 text-xl text-blue-100">
                {renderStructuredDescription(card.description)}
              </div>

              {/* Status Message */}
              {!card.isActive && (
                <div className="bg-yellow-500/30 border border-yellow-400/50 rounded-xl p-5 mb-8 backdrop-blur-sm">
                  <div className="flex items-center">
                    <AlertCircle className="w-6 h-6 text-yellow-300 mr-3" />
                    <p className="text-yellow-100 font-medium">
                      This program is currently not accepting applications. Please check back later for updates.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {card.imageUrl && (
              <div className="relative h-[500px] rounded-3xl bg-white overflow-hidden shadow-2xl border-4 border-white/20">
                <Image
                  src={card.imageUrl}
                  alt={card.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                {!card.isActive && (
                  <div className="absolute inset-0 bg-red-500/40 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-red-500 text-white px-8 py-4 rounded-full font-bold text-xl shadow-2xl">
                      Applications Closed
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Info Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200 px-4 py-2 rounded-full text-sm font-medium">
              <Info className="w-4 h-4 mr-2" />
              Quick Information
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Program Overview</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Key details about this study program</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Duration */}
            {(card.duration || blocks.some(b => b.title.toLowerCase().includes('duration'))) && (
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                      <Clock className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Duration</h3>
                  </div>
                  <p className="text-2xl font-semibold text-gray-800">
                    {card.duration || blocks.find(b => b.title.toLowerCase().includes('duration'))?.value || 'N/A'}
                  </p>
                </div>
              </Card>
            )}

            {/* Location */}
            {(card.location || blocks.some(b => b.title.toLowerCase().includes('location'))) && (
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors">
                      <MapPin className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Location</h3>
                  </div>
                  <p className="text-2xl font-semibold text-gray-800">
                    {card.location || blocks.find(b => b.title.toLowerCase().includes('location'))?.value || 'N/A'}
                  </p>
                </div>
              </Card>
            )}

            {/* Intake */}
            {(card.intake || blocks.some(b => b.title.toLowerCase().includes('intake'))) && (
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-purple-200 transition-colors">
                      <Calendar className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Intake Periods</h3>
                  </div>
                  <p className="text-2xl font-semibold text-gray-800">
                    {card.intake || blocks.find(b => b.title.toLowerCase().includes('intake'))?.value || 'N/A'}
                  </p>
                </div>
              </Card>
            )}

            {/* Button Link */}
            {card.link && (
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-orange-200 transition-colors">
                      <ExternalLink className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Application</h3>
                  </div>
                  <Link
                    href={card.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold text-lg"
                  >
                    Apply Now
                    <ExternalLink className="w-5 h-5 ml-2" />
                  </Link>
                </div>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Dynamic Blocks Section */}
      {blocks && blocks.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200 px-4 py-2 rounded-full text-sm font-medium">
                <Info className="w-4 h-4 mr-2" />
                Key Information
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Program Details</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Additional information about this program</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blocks.map((block) => (
                <Card key={block.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      {block.icon && (
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mr-4 group-hover:from-blue-200 group-hover:to-indigo-200 transition-all">
                          {renderIcon(block.icon)}
                        </div>
                      )}
                      <h3 className="text-xl font-bold text-gray-900">{block.title}</h3>
                    </div>
                    <p className="text-xl font-semibold text-gray-800">{block.value}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Requirements Section */}
      {card.requirements && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200 px-4 py-2 rounded-full text-sm font-medium">
                <AlertCircle className="w-4 h-4 mr-2" />
                Requirements
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Admission Requirements</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">What you need to apply for this program</p>
            </div>

            <Card className="max-w-4xl mx-auto border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="prose prose-lg max-w-none">
                  {formatRequirements(card.requirements)}
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
              <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-200 px-4 py-2 rounded-full text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-2" />
                Detailed Information
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Comprehensive Details & Comparisons
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore detailed information and comparisons to make an informed decision
              </p>
            </div>

            <div className="space-y-16">
              {dynamicTables.map((table, index) => (
                <div key={`table-${table.id}-${index}`} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center mb-6">
                    {table.iconUrl && (
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                        <Image
                          src={table.iconUrl}
                          alt={table.title}
                          width={24}
                          height={24}
                          className="text-gray-700"
                        />
                      </div>
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
      <section className={`py-20 bg-gradient-to-r ${card.isActive ? 'from-blue-600 to-indigo-700' : 'from-gray-700 to-gray-900'} text-white relative overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {card.isActive ? 'Ready to Start Your Journey?' : 'Stay Updated'}
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
            {card.isActive
              ? 'Get personalized guidance and support for your study abroad application'
              : 'Get notified when applications reopen for this program'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {card.isActive ? (
              <>
                {card.link ? (
                  <Link href={card.link} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                      Apply Now
                    </Button>
                  </Link>
                ) : (
                  <Link href="/contact">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                      Get Free Consultation
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <Link href="/contact">
                <Button size="lg" className="bg-white text-gray-700 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                  Notify Me
                </Button>
              </Link>
            )}
            <Link href={`/study/${slug}`}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold transition-all">
                Explore More Programs
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}