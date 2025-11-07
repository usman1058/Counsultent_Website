'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, Clock, Users, MapPin, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

interface StudyPageClientProps {
  studyPage: any
  countryData: any
}

export default function StudyPageClient({ studyPage, countryData }: StudyPageClientProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const cardsPerPage = 6

  // Flatten all cards from all categories
  const allCards = studyPage.categories.flatMap((category: any) =>
    category.cards.map((card: any) => ({ ...card, categoryName: category.title }))
  )

  // Filter cards based on active tab, selected category, and search query
  const filteredCards = allCards.filter((card: any) => {
    const isActiveMatch = activeTab === 'active' ? card.isActive : !card.isActive
    const categoryMatch = selectedCategory === 'all' || card.categoryName === selectedCategory

    // Search functionality - check if search query matches title, description, location, etc.
    const normalizeText = (value: any): string => {
      if (!value) return ''
      if (typeof value === 'string') return value
      if (typeof value === 'object') {
        // Handle JSON descriptions like [{ type: 'paragraph', content: 'text' }]
        try {
          if (Array.isArray(value)) {
            return value.map((v) => v.content || '').join(' ')
          } else if (value.content) {
            return value.content
          } else {
            return JSON.stringify(value)
          }
        } catch {
          return ''
        }
      }
      return String(value)
    }

    const searchMatch =
      searchQuery === '' ||
      normalizeText(card.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
      normalizeText(card.description).toLowerCase().includes(searchQuery.toLowerCase()) ||
      normalizeText(card.location).toLowerCase().includes(searchQuery.toLowerCase()) ||
      normalizeText(card.duration).toLowerCase().includes(searchQuery.toLowerCase()) ||
      normalizeText(card.intake).toLowerCase().includes(searchQuery.toLowerCase())

    return isActiveMatch && categoryMatch && searchMatch
  })

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, selectedCategory, searchQuery])

  // Calculate pagination
  const indexOfLastCard = currentPage * cardsPerPage
  const indexOfFirstCard = indexOfLastCard - cardsPerPage
  const currentCards = filteredCards.slice(indexOfFirstCard, indexOfLastCard)
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage)

  return (
    <div>
      {/* Enhanced Banner Section */}
      <section className="relative h-[600px] bg-gradient-to-br from-primary/20 via-blue-100 to-indigo-100 overflow-hidden">
        {studyPage.bannerUrl ? (
          <div className="absolute inset-0">
            <img
              src={studyPage.bannerUrl}
              alt={studyPage.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-transparent"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-blue-200 to-indigo-200">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-transparent"></div>
            {/* Animated background elements */}
            <motion.div
              className="absolute top-20 left-10 w-72 h-72 bg-white/20 rounded-full mix-blend-multiply filter blur-xl opacity-70"
              animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
            />
            <motion.div
              className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70"
              animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
              transition={{ duration: 25, repeat: Infinity, repeatType: "reverse" }}
            />
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-center text-white max-w-5xl mx-auto px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="text-7xl md:text-9xl">{countryData.flag}</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
              {studyPage.title}
            </h1>
            <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed">
              {studyPage.description}
            </p>

            {/* Quick stats */}
            <motion.div
              className="grid grid-cols-3 gap-8 mt-12 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{countryData.stats.universities}</div>
                <div className="text-sm text-white/80">Universities</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{countryData.stats.students}</div>
                <div className="text-sm text-white/80">International Students</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{countryData.stats.employment}</div>
                <div className="text-sm text-white/80">Employment Rate</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Cards Section with Active/Inactive Tabs and Categories */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Explore Study Programs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover various study programs and opportunities available in {studyPage.title.split(' in ')[1]}
            </p>
          </motion.div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search programs by title, location, duration, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg border-gray-300 focus:border-primary focus:ring-primary rounded-full shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="mt-2 text-center text-sm text-gray-600">
                Found {filteredCards.length} result{filteredCards.length !== 1 ? 's' : ''} for "{searchQuery}"
              </div>
            )}
          </div>

          {/* Active/Inactive Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'active'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <div className="flex items-center">
                  <ToggleRight className="w-5 h-5 mr-2" />
                  Active Programs
                  <Badge className="ml-2 bg-green-100 text-green-800">
                    {allCards.filter((card: any) => card.isActive).length}
                  </Badge>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('inactive')}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'inactive'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <div className="flex items-center">
                  <ToggleLeft className="w-5 h-5 mr-2" />
                  Inactive Programs
                  <Badge className="ml-2 bg-red-100 text-red-800">
                    {allCards.filter((card: any) => !card.isActive).length}
                  </Badge>
                </div>
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-lg bg-gray-100 p-1 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors m-1 ${selectedCategory === 'all'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                All Categories
              </button>
              {studyPage.categories.map((category: any) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.title)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors m-1 ${selectedCategory === category.title
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {category.title}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid with Pagination */}
          {currentCards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {currentCards.map((card: any, cardIndex: number) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: cardIndex * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Card className={`h-[450px] flex flex-col border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-white group-hover:bg-gradient-to-br group-hover:from-primary/5 group-hover:to-white overflow-hidden ${!card.isActive ? 'opacity-75' : ''
                    }`}>
                    {/* Card Image */}
                    <div className="relative h-60 flex-shrink-0 overflow-hidden">
                      {card.imageUrl ? (
                        <div className="relative w-full h-full">
                          <img
                            src={card.imageUrl}
                            alt={card.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-blue-500/20 flex items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-500/5"></div>
                          <motion.div
                            className="text-4xl relative z-10"
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                          >
                            🎓
                          </motion.div>
                        </div>
                      )}

                      {/* Status badge overlay */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge className={`${card.isActive ? 'bg-green-500' : 'bg-red-500'} text-white text-xs shadow-md`}>
                          {card.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge className="bg-white/90 text-primary text-xs shadow-md">
                          {card.categoryName}
                        </Badge>
                      </div>
                    </div>

                    {/* Card Content */}
                    <CardContent className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                          {card.title}
                        </h3>
                        {card.cardCategory && (
                          <Badge className="bg-gray-100 text-gray-800 text-xs">
                            {card.cardCategory}
                          </Badge>
                        )}
                      </div>

                      {/* Key Details as Badges */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {card.duration && (
                          <div className="flex items-center bg-blue-50 rounded-full px-3 py-1">
                            <Clock className="w-3 h-3 text-blue-600 mr-1" />
                            <span className="text-xs text-blue-800 font-medium">{card.duration}</span>
                          </div>
                        )}
                        {card.location && (
                          <div className="flex items-center bg-green-50 rounded-full px-3 py-1">
                            <MapPin className="w-3 h-3 text-green-600 mr-1" />
                            <span className="text-xs text-green-800 font-medium">{card.location}</span>
                          </div>
                        )}
                        {card.intake && (
                          <div className="flex items-center bg-purple-50 rounded-full px-3 py-1">
                            <Users className="w-3 h-3 text-purple-600 mr-1" />
                            <span className="text-xs text-purple-800 font-medium">{card.intake}</span>
                          </div>
                        )}
                      </div>

                      {/* View Details Button */}
                      <div className="mt-auto">
                        <Link href={`/study/${studyPage.slug}/${card.id}`}>
                          <Button className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white text-sm py-2 transition-all duration-300">
                            View Details
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">No programs found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchQuery
                  ? `No programs match your search for "${searchQuery}". Try different keywords or clear the search.`
                  : `No ${activeTab} programs found in ${selectedCategory === 'all' ? 'any category' : selectedCategory}.`
                }
              </p>
              {searchQuery && (
                <Button
                  onClick={() => setSearchQuery('')}
                  variant="outline"
                  className="mt-4"
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                variant="outline"
                className="flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className="w-10 h-10"
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                variant="outline"
                className="flex items-center"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Study {studyPage.title.split(' in ')[1]}?
            </h2>
            <p className="text-xl mb-10 opacity-90 max-w-3xl mx-auto">
              Get expert guidance personalized for your study abroad journey.
              Let us help you achieve your dreams of studying in {studyPage.title.split(' in ')[1]}.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/contact">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 px-10 py-4 text-lg">
                    Get Started Today
                  </Button>
                </motion.div>
              </Link>
              <Link href="/contact">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-primary transition-all duration-300 px-10 py-4 text-lg">
                    Free Consultation
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}