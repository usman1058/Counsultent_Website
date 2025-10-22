'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Calendar, User, MapPin, Users, Star, Clock, CheckCircle, Award, Globe, BookOpen, Heart, Shield, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface StudyPageClientProps {
  studyPage: any
  countryData: any
}

export default function StudyPageClient({ studyPage, countryData }: StudyPageClientProps) {
  return (
    <div>
      {/* Enhanced Banner Section */}
      <section className="relative h-[500px] bg-gradient-to-br from-primary/20 via-blue-100 to-indigo-100 overflow-hidden">
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
              className="mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="text-6xl md:text-8xl">{countryData.flag}</span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              {studyPage.title}
            </h1>
            <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed">
              {studyPage.description}
            </p>
            
            {/* Quick stats */}
            <motion.div 
              className="grid grid-cols-3 gap-6 mt-10 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{countryData.stats.universities}</div>
                <div className="text-sm text-white/80">Universities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{countryData.stats.students}</div>
                <div className="text-sm text-white/80">International Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{countryData.stats.employment}</div>
                <div className="text-sm text-white/80">Employment Rate</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Country Highlights */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20" variant="secondary">
              <Star className="w-3 h-3 mr-1" />
              Why Study {studyPage.title.split(' in ')[1]}?
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Key Highlights & Benefits
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {countryData.highlights.map((highlight: string, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 group border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
                  <CardContent className="p-6 text-center">
                    <motion.div 
                      className={`w-16 h-16 bg-gradient-to-br ${countryData.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                      whileHover={{ scale: 1.1, rotate: 6 }}
                    >
                      <Award className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{highlight}</h3>
                    <p className="text-sm text-gray-600">Experience the best of what this country has to offer</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Benefits Section */}
          <div className="bg-gradient-to-r from-primary/5 to-blue-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Key Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {countryData.benefits.map((benefit: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <span className="text-gray-700 font-medium">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories and Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200" variant="secondary">
              <BookOpen className="w-3 h-3 mr-1" />
              Study Programs
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Study Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover various study programs and opportunities available in {studyPage.title.split(' in ')[1]}
            </p>
          </motion.div>

          <div className="space-y-16">
            {studyPage.categories.map((category: any, categoryIndex: number) => (
              <motion.div 
                key={category.id} 
                className="space-y-8"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <Badge className="mb-4 bg-gradient-to-r from-primary/10 to-primary/20 text-primary hover:from-primary/20 hover:to-primary/30" variant="secondary">
                      <Globe className="w-3 h-3 mr-1" />
                      {category.title}
                    </Badge>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                      {category.title}
                    </h3>
                    {category.description && (
                      <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        {category.description}
                      </p>
                    )}
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {category.cards.map((card: any, cardIndex: number) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: cardIndex * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -10 }}
                      className="group"
                    >
                      <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer bg-gradient-to-br from-white to-gray-50 group-hover:from-primary/5 group-hover:to-primary/10">
                        <div className="relative h-48 overflow-hidden">
                          {card.imageUrl ? (
                            <div className="relative w-full h-full">
                              <img 
                                src={card.imageUrl} 
                                alt={card.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-500/5"></div>
                              <motion.div 
                                className="text-6xl relative z-10"
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                              >
                                🎓
                              </motion.div>
                            </div>
                          )}
                        </div>
                        
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20" variant="secondary">
                              {category.title}
                            </Badge>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="w-4 h-4 mr-1" />
                              {card.duration || '4 years'}
                            </div>
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                            {card.title}
                          </h3>
                          
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {card.description}
                          </p>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="w-4 h-4 mr-1" />
                              {card.location || 'Multiple campuses'}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Users className="w-4 h-4 mr-1" />
                              {card.intake || 'Fall & Spring'}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Link href={`/study/${studyPage.slug}/${card.id}`}>
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Button variant="outline" className="w-full border-2 border-primary/20 hover:border-primary hover:bg-primary hover:text-white transition-all duration-300 group">
                                  <span className="mr-2 group-hover:mr-3 transition-all duration-300">Learn More</span>
                                  <ArrowRight className="w-4 h-4" />
                                </Button>
                              </motion.div>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-white/20 hover:bg-white/30 text-white border-white/30" variant="secondary">
              <Heart className="w-3 h-3 mr-1" />
              Start Your Journey
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Study {studyPage.title.split(' in ')[1]}?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              Get expert guidance personalized for your study abroad journey. 
              Let us help you achieve your dreams of studying in {studyPage.title.split(' in ')[1]}.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 px-8">
                    <Shield className="w-4 h-4 mr-2" />
                    Get Started Today
                  </Button>
                </motion.div>
              </Link>
              <Link href="/contact">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-primary transition-all duration-300 px-8">
                    <Users className="w-4 h-4 mr-2" />
                    Free Consultation
                  </Button>
                </motion.div>
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Expert Guidance</h3>
                <p className="text-sm opacity-80">10+ years of experience</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-1">High Success Rate</h3>
                <p className="text-sm opacity-80">98% visa approval rate</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-1">500+ Students</h3>
                <p className="text-sm opacity-80">Successfully placed</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}