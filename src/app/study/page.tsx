'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Globe, GraduationCap, Users, Star, MapPin, TrendingUp, Shield, Award, Clock, CheckCircle, Heart, Flag, Plane, BookOpen } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { motion } from 'framer-motion'

export default function StudyDestinationsPage() {
  const [studyPages, setStudyPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudyPages = async () => {
      try {
        const response = await fetch('/api/study-pages')
        if (response.ok) {
          const data = await response.json()
          setStudyPages(data)
        }
      } catch (error) {
        console.error('Failed to fetch study pages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudyPages()
  }, [])

  // Get country flag emojis based on country names
  const getCountryFlag = (title: string) => {
    // Dynamic flag selection based on keywords in title
    const flags: Record<string, string> = {
      'italy': '🇮🇹', 'canada': '🇨🇦', 'uk': '🇬🇧', 'usa': '🇺🇸', 'australia': '🇦🇺',
      'germany': '🇩🇪', 'france': '🇫🇷', 'spain': '🇪🇸', 'japan': '🇯🇵', 'china': '🇨🇳',
      'india': '🇮🇳', 'singapore': '🇸🇬', 'malaysia': '🇲🇾', 'uae': '🇦🇪', 'netherlands': '🇳🇱',
      'sweden': '🇸🇪', 'norway': '🇳🇴', 'denmark': '🇩🇰', 'finland': '🇫🇮', 'switzerland': '🇨🇭',
      'austria': '🇦🇹', 'belgium': '🇧🇪', 'ireland': '🇮🇪', 'portugal': '🇵🇹', 'greece': '🇬🇷',
      'new zealand': '🇳🇿', 'south korea': '🇰🇷', 'brazil': '🇧🇷', 'argentina': '🇦🇷', 'mexico': '🇲🇽'
    }
    
    const lowerTitle = title.toLowerCase()
    for (const [country, flag] of Object.entries(flags)) {
      if (lowerTitle.includes(country)) {
        return flag
      }
    }
    return '🌍'
  }

  // Get country-specific highlights
  const getCountryHighlights = (title: string) => {
    // Dynamic highlights based on keywords in title
    const lowerTitle = title.toLowerCase()
    
    if (lowerTitle.includes('europe')) {
      return ['Rich Culture', 'Quality Education', 'Scholarships Available']
    }
    if (lowerTitle.includes('america') || lowerTitle.includes('canada') || lowerTitle.includes('usa')) {
      return ['Research Opportunities', 'Career Growth', 'Global Recognition']
    }
    if (lowerTitle.includes('asia') || lowerTitle.includes('australia')) {
      return ['Technology Focus', 'Innovation Hub', 'International Experience']
    }
    
    return ['Quality Education', 'International Experience', 'Career Opportunities']
  }

  // Get country-specific stats
  const getCountryStats = (title: string) => {
    // Dynamic stats based on keywords in title
    const lowerTitle = title.toLowerCase()
    
    if (lowerTitle.includes('usa')) {
      return { universities: '200+', students: '1M+', employment: '88%' }
    }
    if (lowerTitle.includes('uk')) {
      return { universities: '150+', students: '500K+', employment: '92%' }
    }
    if (lowerTitle.includes('canada')) {
      return { universities: '100+', students: '200K+', employment: '90%' }
    }
    if (lowerTitle.includes('australia')) {
      return { universities: '40+', students: '300K+', employment: '87%' }
    }
    if (lowerTitle.includes('germany')) {
      return { universities: '300+', students: '400K+', employment: '91%' }
    }
    
    return { universities: '50+', students: '100K+', employment: '85%' }
  }

  // Get country-specific benefits
  const getCountryBenefits = (title: string) => {
    // Dynamic benefits based on keywords in title
    const lowerTitle = title.toLowerCase()
    
    if (lowerTitle.includes('europe')) {
      return ['Historical Universities', 'Cultural Experience', 'EU Opportunities']
    }
    if (lowerTitle.includes('america') || lowerTitle.includes('canada') || lowerTitle.includes('usa')) {
      return ['World-Class Research', 'Diverse Campus Life', 'Career Advancement']
    }
    if (lowerTitle.includes('asia') || lowerTitle.includes('australia')) {
      return ['Technology Innovation', 'Global Business Hub', 'Quality Lifestyle']
    }
    
    return ['Quality Education', 'International Environment', 'Career Opportunities']
  }

  const totalCards = studyPages.length * 6 // Assuming 6 categories per page

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Globe className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Study Destinations</h2>
            <p className="text-gray-600">Preparing amazing study opportunities for you...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4" variant="secondary">
              <Globe className="w-3 h-3 mr-1" />
              {studyPages.length} Countries Available
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Study Destinations
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Explore our comprehensive guides to studying abroad in top destinations worldwide. 
              From visa requirements to scholarship opportunities, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Free Consultation
                </Button>
              </Link>
              <Link href="/lucky-draw">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Enter Lucky Draw
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{studyPages.length}</div>
              <p className="text-gray-600">Study Destinations</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{totalCards}</div>
              <p className="text-gray-600">Detailed Guides</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">98%</div>
              <p className="text-gray-600">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Study Destinations Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Study Destinations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Click on any destination to explore universities, scholarships, and detailed guidance
            </p>
          </div>

          {studyPages.length === 0 ? (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Study Destinations Available
              </h3>
              <p className="text-gray-600 mb-6">
                We're currently adding new study destinations. Check back soon!
              </p>
              <Link href="/contact">
                <Button>Get Notified When Available</Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {studyPages.map((page, index) => {
                const stats = getCountryStats(page.title)
                const benefits = getCountryBenefits(page.title)
                
                return (
                  <motion.div
                    key={page.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -15 }}
                    className="group"
                  >
                    <Link href={`/study/${page.slug}`}>
                      <Card className="h-full overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-700 cursor-pointer bg-gradient-to-br from-white via-white to-gray-50 group-hover:from-primary/5 group-hover:to-primary/10 relative">
                        {/* Card Background Pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        
                        <div className="relative h-64 overflow-hidden">
                          {page.bannerUrl ? (
                            <div className="relative w-full h-full">
                              <img 
                                src={page.bannerUrl} 
                                alt={page.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                              <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                              
                              {/* Animated overlay pattern */}
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent animate-pulse"></div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-blue-100 to-indigo-100 flex items-center justify-center relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-500/10"></div>
                              <motion.div 
                                className="text-7xl relative z-10"
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                              >
                                {getCountryFlag(page.title)}
                              </motion.div>
                              
                              {/* Floating background elements */}
                              <motion.div
                                className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                              />
                              <motion.div
                                className="absolute bottom-4 left-4 w-6 h-6 bg-white/20 rounded-full"
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 1 }}
                              />
                            </div>
                          )}
                          
                          {/* Enhanced Floating badges */}
                          <div className="absolute top-4 left-4 z-20">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Badge className="bg-white/95 backdrop-blur-sm text-black px-3 py-1.5 shadow-lg border-0 hover:bg-white transition-colors duration-300">
                                <Star className="w-3 h-3 mr-1 text-yellow-500" />
                                Featured
                              </Badge>
                            </motion.div>
                          </div>
                          <div className="absolute top-4 right-4 z-20">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Badge className="bg-gradient-to-r from-primary/90 to-primary/80 backdrop-blur-sm text-white px-3 py-1.5 shadow-lg border-0 hover:from-primary hover:to-primary/90 transition-all duration-300">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Popular
                              </Badge>
                            </motion.div>
                          </div>
                          
                          {/* Enhanced Country flag overlay */}
                          <div className="absolute bottom-4 left-4 z-20">
                            <motion.div 
                              className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl border-2 border-white/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300"
                              whileHover={{ scale: 1.1, rotate: 6 }}
                            >
                              <span className="text-3xl">{getCountryFlag(page.title)}</span>
                            </motion.div>
                          </div>

                          {/* Stats overlay */}
                          <div className="absolute bottom-4 right-4 z-20">
                            <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-white/50">
                              <span className="text-sm font-bold text-gray-800">
                                6 Categories
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <CardHeader className="pb-4 relative z-10">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-500 mb-3 line-clamp-1">
                                {page.title}
                              </CardTitle>
                              <CardDescription className="text-gray-600 line-clamp-2 leading-relaxed text-sm">
                                {page.description || 'Discover amazing opportunities to study in this beautiful country'}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0 relative z-10">
                          {/* Quick stats */}
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="text-center p-2 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors duration-300">
                              <div className="text-lg font-bold text-primary">{stats.universities}</div>
                              <div className="text-xs text-gray-600">Universities</div>
                            </div>
                            <div className="text-center p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors duration-300">
                              <div className="text-lg font-bold text-blue-600">{stats.students}</div>
                              <div className="text-xs text-gray-600">Students</div>
                            </div>
                            <div className="text-center p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors duration-300">
                              <div className="text-lg font-bold text-green-600">{stats.employment}</div>
                              <div className="text-xs text-gray-600">Employment</div>
                            </div>
                          </div>

                          {/* Country highlights */}
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {getCountryHighlights(page.title).slice(0, 3).map((highlight, idx) => (
                                <motion.div
                                  key={idx}
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Badge variant="secondary" className="text-xs bg-gray-100 hover:bg-gray-200 transition-colors duration-300">
                                    {highlight}
                                  </Badge>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* Key benefits */}
                          <div className="mb-4">
                            <div className="space-y-2">
                              {benefits.slice(0, 2).map((benefit, idx) => (
                                <div key={idx} className="flex items-center text-xs text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                                  <CheckCircle className="w-3 h-3 mr-2 text-green-500 flex-shrink-0" />
                                  <span className="line-clamp-1">{benefit}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <div className="flex items-center group-hover:text-primary transition-colors duration-300">
                                <MapPin className="w-3 h-3 mr-1" />
                                <span>International</span>
                              </div>
                              <div className="flex items-center group-hover:text-blue-600 transition-colors duration-300">
                                <Users className="w-3 h-3 mr-1" />
                                <span>Popular</span>
                              </div>
                            </div>
                            
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button variant="outline" className="border-2 border-primary/20 hover:border-primary hover:bg-primary hover:text-white transition-all duration-300 group text-sm px-4 py-2">
                                <span className="mr-2 group-hover:mr-3 transition-all duration-300">Explore</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                              </Button>
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Can't Find Your Dream Destination?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            We're constantly adding new study destinations. Let us know where you'd like to study!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Request a Destination
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-primary">
                Get Expert Advice
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Comprehensive Guides
              </h3>
              <p className="text-gray-600">
                Detailed information about universities, scholarships, visa requirements, and cost of living for each destination.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Expert Insights
              </h3>
              <p className="text-gray-600">
                First-hand experiences and tips from students who have successfully studied in these destinations.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Personalized Support
              </h3>
              <p className="text-gray-600">
                One-on-one guidance to help you choose the right destination and navigate the application process.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}