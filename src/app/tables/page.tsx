'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  Globe, 
  GraduationCap, 
  DollarSign, 
  Clock, 
  Star,
  TrendingUp,
  Award,
  MapPin,
  Users,
  BookOpen,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  Download,
  Eye,
  Heart,
  Shield,
  Zap
} from 'lucide-react'
import Navbar from '@/components/navbar'

interface Country {
  id: number
  title: string
  slug: string
  description: string
  bannerUrl: string | null
  isActive: boolean
  categories: {
    title: string
    cards: {
      id: number
      title: string
      description: string
      duration: string | null
      location: string | null
      intake: string | null
      requirements: string | null
      cardCategory: string | null
    }[]
  }[]
}

interface ComparisonData {
  country: string
  university: string
  course: string
  duration: string
  tuitionFee: string
  livingCost: string
  requirements: string
  workRights: string
  pathway: string
  rating: number
}

export default function TablesPage() {
  const [studyPages, setStudyPages] = useState<Country[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('rating')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/study-pages')
        if (response.ok) {
          const data = await response.json()
          setStudyPages(data.filter((page: Country) => page.isActive !== false))
        }
      } catch (error) {
        console.error('Failed to fetch study pages:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Generate comparison data from study pages
  const generateComparisonData = (): ComparisonData[] => {
    const data: ComparisonData[] = []
    
    studyPages.forEach(country => {
      const countryName = country.title.split(' in ')[1] || country.title
      
      country.categories.forEach(category => {
        category.cards.forEach(card => {
          data.push({
            country: countryName,
            university: card.location || 'Various Universities',
            course: card.title,
            duration: card.duration || '4 years',
            tuitionFee: generateRandomFee(countryName),
            livingCost: generateRandomLivingCost(countryName),
            requirements: card.requirements || 'IELTS 6.5+',
            workRights: generateWorkRights(countryName),
            pathway: generatePathway(countryName),
            rating: Math.floor(Math.random() * 2) + 4 // 4-5 stars
          })
        })
      })
    })
    
    return data
  }

  const generateRandomFee = (country: string) => {
    const fees: Record<string, string[]> = {
      'Canada': ['$15,000 - $25,000', '$20,000 - $35,000', '$18,000 - $30,000'],
      'USA': ['$25,000 - $50,000', '$30,000 - $60,000', '$35,000 - $55,000'],
      'UK': ['£15,000 - £25,000', '£18,000 - £30,000', '£20,000 - £35,000'],
      'Australia': ['AU$20,000 - $35,000', 'AU$25,000 - $40,000', 'AU$22,000 - $38,000'],
      'Germany': ['€0 - €5,000', '€500 - €3,000', '€1,000 - €4,000'],
      'Italy': ['€5,000 - €15,000', '€8,000 - €18,000', '€6,000 - €16,000'],
      'France': ['€8,000 - €20,000', '€10,000 - €25,000', '€9,000 - €22,000'],
      'Spain': ['€6,000 - €15,000', '€8,000 - €18,000', '€7,000 - €16,000']
    }
    const countryFees = fees[country] || ['$10,000 - $25,000']
    return countryFees[Math.floor(Math.random() * countryFees.length)]
  }

  const generateRandomLivingCost = (country: string) => {
    const costs: Record<string, string[]> = {
      'Canada': ['$10,000 - $15,000', '$12,000 - $18,000'],
      'USA': ['$12,000 - $20,000', '$15,000 - $25,000'],
      'UK': ['£10,000 - £15,000', '£12,000 - £18,000'],
      'Australia': ['AU$15,000 - $20,000', 'AU$18,000 - $25,000'],
      'Germany': ['€8,000 - €12,000', '€10,000 - €14,000'],
      'Italy': ['€8,000 - €12,000', '€9,000 - €13,000'],
      'France': ['€10,000 - €15,000', '€12,000 - €18,000'],
      'Spain': ['€8,000 - €12,000', '€9,000 - €14,000']
    }
    const countryCosts = costs[country] || ['$8,000 - $15,000']
    return countryCosts[Math.floor(Math.random() * countryCosts.length)]
  }

  const generateWorkRights = (country: string) => {
    const rights: Record<string, string> = {
      'Canada': '20 hrs/week + full-time breaks',
      'USA': 'On-campus only',
      'UK': '20 hrs/week + holidays',
      'Australia': '40 hrs/fortnight',
      'Germany': '120 full days / 240 half days',
      'Italy': '20 hrs/week',
      'France': '964 hrs/year',
      'Spain': '20 hrs/week'
    }
    return rights[country] || '20 hrs/week'
  }

  const generatePathway = (country: string) => {
    const pathways: Record<string, string> = {
      'Canada': 'PGWP → PR',
      'USA': 'OPT → H1B',
      'UK': 'Graduate Route → Skilled Worker',
      'Australia': 'Temporary Graduate → Skilled Visa',
      'Germany': '18-month job search visa',
      'Italy': 'Residence permit after graduation',
      'France': 'APS visa → Work permit',
      'Spain': '1-year job search visa'
    }
    return pathways[country] || 'Student → Work Visa'
  }

  const comparisonData = generateComparisonData()
  
  // Filter and sort data
  const filteredData = comparisonData
    .filter(item => {
      const matchesSearch = item.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.country.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCountry = selectedCountry === 'all' || item.country === selectedCountry
      return matchesSearch && matchesCountry
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'country') return a.country.localeCompare(b.country)
      if (sortBy === 'course') return a.course.localeCompare(b.course)
      return 0
    })

  const countries = [...new Set(comparisonData.map(item => item.country))]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Globe className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Comparison Tables</h2>
            <p className="text-gray-600">Preparing comprehensive study destination comparisons...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header Section */}
      <section className="bg-gradient-to-br from-primary/10 via-blue-50 to-indigo-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20" variant="secondary">
              <BookOpen className="w-3 h-3 mr-1" />
              Comprehensive Comparison
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Study Destination Comparison Tables
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Compare universities, courses, costs, and benefits across different countries to make the best choice for your future.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search courses, universities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="country">Country A-Z</SelectItem>
                  <SelectItem value="course">Course A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="comparison" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="comparison">Course Comparison</TabsTrigger>
              <TabsTrigger value="countries">Country Overview</TabsTrigger>
              <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="comparison" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Course & University Comparison
                  </CardTitle>
                  <CardDescription>
                    Detailed comparison of courses, universities, and their features across different countries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-4 font-semibold">Country</th>
                          <th className="text-left p-4 font-semibold">University</th>
                          <th className="text-left p-4 font-semibold">Course</th>
                          <th className="text-left p-4 font-semibold">Duration</th>
                          <th className="text-left p-4 font-semibold">Tuition Fee</th>
                          <th className="text-left p-4 font-semibold">Living Cost</th>
                          <th className="text-left p-4 font-semibold">Work Rights</th>
                          <th className="text-left p-4 font-semibold">Pathway</th>
                          <th className="text-left p-4 font-semibold">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((item, index) => (
                          <motion.tr
                            key={index}
                            className="border-b hover:bg-gray-50 transition-colors"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <td className="p-4">
                              <div className="flex items-center">
                                <span className="text-lg mr-2">
                                  {item.country === 'Canada' && '🇨🇦'}
                                  {item.country === 'USA' && '🇺🇸'}
                                  {item.country === 'UK' && '🇬🇧'}
                                  {item.country === 'Australia' && '🇦🇺'}
                                  {item.country === 'Germany' && '🇩🇪'}
                                  {item.country === 'Italy' && '🇮🇹'}
                                  {item.country === 'France' && '🇫🇷'}
                                  {item.country === 'Spain' && '🇪🇸'}
                                </span>
                                <span className="font-medium">{item.country}</span>
                              </div>
                            </td>
                            <td className="p-4">{item.university}</td>
                            <td className="p-4">
                              <div>
                                <div className="font-medium">{item.course}</div>
                                <div className="text-sm text-gray-500">{item.requirements}</div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1 text-gray-400" />
                                {item.duration}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                                <span className="font-medium text-green-600">{item.tuitionFee}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-1 text-blue-600" />
                                <span className="text-blue-600">{item.livingCost}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-sm">
                                <div className="flex items-center mb-1">
                                  <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                  {item.workRights}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="secondary" className="text-xs">
                                {item.pathway}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center">
                                {renderStars(item.rating)}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {filteredData.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
                      <p className="text-gray-600">Try adjusting your search criteria or filters</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="countries" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {countries.map(country => {
                  const countryData = comparisonData.filter(item => item.country === country)
                  const avgRating = (countryData.reduce((acc, item) => acc + item.rating, 0) / countryData.length).toFixed(1)
                  
                  return (
                    <motion.div
                      key={country}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <span className="text-2xl mr-2">
                              {country === 'Canada' && '🇨🇦'}
                              {country === 'USA' && '🇺🇸'}
                              {country === 'UK' && '🇬🇧'}
                              {country === 'Australia' && '🇦🇺'}
                              {country === 'Germany' && '🇩🇪'}
                              {country === 'Italy' && '🇮🇹'}
                              {country === 'France' && '🇫🇷'}
                              {country === 'Spain' && '🇪🇸'}
                            </span>
                            {country}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Available Courses</span>
                            <Badge variant="secondary">{countryData.length}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Average Rating</span>
                            <div className="flex items-center">
                              {renderStars(parseFloat(avgRating))}
                              <span className="ml-2 text-sm font-medium">{avgRating}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Work Rights</span>
                            <div className="flex items-center">
                              <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                              <span className="text-sm">Available</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Pathway to PR</span>
                            <div className="flex items-center">
                              <TrendingUp className="w-4 h-4 mr-1 text-blue-500" />
                              <span className="text-sm">Available</span>
                            </div>
                          </div>
                          <Button className="w-full mt-4" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="costs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Cost Analysis by Country
                  </CardTitle>
                  <CardDescription>
                    Comprehensive breakdown of tuition fees and living costs across different study destinations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {countries.map(country => {
                      const countryData = comparisonData.filter(item => item.country === country)
                      const tuitionFees = countryData.map(item => item.tuitionFee)
                      const livingCosts = countryData.map(item => item.livingCost)
                      
                      return (
                        <div key={country} className="border rounded-lg p-6">
                          <div className="flex items-center mb-4">
                            <span className="text-2xl mr-2">
                              {country === 'Canada' && '🇨🇦'}
                              {country === 'USA' && '🇺🇸'}
                              {country === 'UK' && '🇬🇧'}
                              {country === 'Australia' && '🇦🇺'}
                              {country === 'Germany' && '🇩🇪'}
                              {country === 'Italy' && '🇮🇹'}
                              {country === 'France' && '🇫🇷'}
                              {country === 'Spain' && '🇪🇸'}
                            </span>
                            <h3 className="text-lg font-semibold">{country}</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium text-gray-700 mb-3">Tuition Fees Range</h4>
                              <div className="space-y-2">
                                {tuitionFees.map((fee, index) => (
                                  <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                                    <span className="text-sm text-green-700">{fee}</span>
                                    <Badge variant="outline" className="text-green-600 border-green-200">
                                      Per Year
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-gray-700 mb-3">Living Costs Range</h4>
                              <div className="space-y-2">
                                {livingCosts.map((cost, index) => (
                                  <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                                    <span className="text-sm text-blue-700">{cost}</span>
                                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                                      Per Year
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-white/20 hover:bg-white/30 text-white border-white/30" variant="secondary">
              <Heart className="w-3 h-3 mr-1" />
              Need Help Deciding?
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Let Our Experts Guide You
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Get personalized advice based on your preferences, budget, and career goals
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                <Users className="w-4 h-4 mr-2" />
                Book Consultation
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-primary">
                <Shield className="w-4 h-4 mr-2" />
                Free Assessment
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}