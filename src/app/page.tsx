'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Navbar from '@/components/navbar'
import { motion } from 'framer-motion'
import {
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  FileText,
  DollarSign,
  Star,
  ArrowRight,
  Globe,
  Award,
  Users,
  CheckCircle,
  TrendingUp,
  Clock,
  Heart,
  Shield,
  Zap,
  Target,
  BookOpen,
  Lightbulb,
  Rocket,
  Trophy,
  Flag,
  Gift
} from 'lucide-react'
import TestimonialsSection from '@/components/testimonials-section'
import Script from 'next/script'

export default function Home() {
  const [studyPages, setStudyPages] = useState<any[]>([])
  const [siteSettings, setSiteSettings] = useState<any>(null)
  const [testimonials, setTestimonials] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studyRes, settingsRes, testimonialsRes] = await Promise.all([
          fetch('/api/study-pages'),
          fetch('/api/admin/settings'),
          fetch('/api/testimonials')
        ])

        if (studyRes.ok) {
          const studyData = await studyRes.json()
          setStudyPages(studyData.filter((page: any) => page.isActive !== false).slice(0, 6))
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json()
          setSiteSettings(settingsData)
        }

        if (testimonialsRes.ok) {
          const testimonialsData = await testimonialsRes.json()
          setTestimonials(testimonialsData.filter((t: any) => t.isFeatured).slice(0, 3))
        }
      } catch (error) {
        console.error('Failed to fetch home data:', error)
      }
    }

    fetchData()
  }, [])
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5"></div>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"
            animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.div
            className="absolute top-40 right-10 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
            animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
            transition={{ duration: 25, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.div
            className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"
            animate={{ x: [0, 50, 0], y: [0, 100, 0] }}
            transition={{ duration: 30, repeat: Infinity, repeatType: "reverse" }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Badge className="mb-4 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 hover:from-green-200 hover:to-emerald-200 border-green-200" variant="secondary">
                  <Award className="w-3 h-3 mr-1" />
                  Certified Expert Visa Consultant
                </Badge>
              </motion.div>

              <motion.h1
                className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Study Abroad with{" "}
                <span className="text-primary bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  {siteSettings?.adminName || 'Hadi'}
                </span>
              </motion.h1>

              <motion.p
                className="text-xl text-gray-600 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Your trusted partner for international education. Expert guidance for admissions,
                scholarships, and visa applications to top universities worldwide.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Link href="/contact">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 group">
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Now
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/lucky-draw">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-primary/20 hover:border-primary hover:bg-primary hover:text-white transition-all duration-300 group">
                      <Heart className="w-4 h-4 mr-2" />
                      Join Lucky Draw
                      <Gift className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform duration-300" />
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              <motion.div
                className="grid grid-cols-3 gap-6 pt-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <div className="text-center group">
                  <div className="flex items-center justify-center mb-2">
                    <motion.div
                      className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Users className="w-5 h-5 text-primary" />
                    </motion.div>
                    <span className="text-2xl font-bold text-gray-900 ml-2">500+</span>
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-primary transition-colors duration-300">Happy Students</span>
                </div>
                <div className="text-center group">
                  <div className="flex items-center justify-center mb-2">
                    <motion.div
                      className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300"
                      whileHover={{ scale: 1.1, rotate: -5 }}
                    >
                      <Globe className="w-5 h-5 text-blue-600" />
                    </motion.div>
                    <span className="text-2xl font-bold text-gray-900 ml-2">15+</span>
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors duration-300">Countries</span>
                </div>
                <div className="text-center group">
                  <div className="flex items-center justify-center mb-2">
                    <motion.div
                      className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors duration-300"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Star className="w-5 h-5 text-green-600" />
                    </motion.div>
                    <span className="text-2xl font-bold text-gray-900 ml-2">98%</span>
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-green-600 transition-colors duration-300">Success Rate</span>
                </div>
              </motion.div>
            </div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="w-full h-96 bg-gradient-to-br from-primary/20 via-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>

                {/* Floating elements */}
                <motion.div
                  className="absolute top-8 right-8 w-16 h-16 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                >
                  <Trophy className="w-8 h-8 text-yellow-600" />
                </motion.div>

                <motion.div
                  className="absolute bottom-8 left-8 w-16 h-16 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 1 }}
                >
                  <Flag className="w-8 h-8 text-primary" />
                </motion.div>

                <motion.div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <div className="w-32 h-32 border-4 border-primary/20 rounded-full"></div>
                </motion.div>

                <div className="text-center relative z-10">
                  <motion.div
                    className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <GraduationCap className="w-12 h-12 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {siteSettings?.adminName || 'Hadi'}
                  </h3>
                  <p className="text-gray-600">{siteSettings?.adminTitle || 'Expert Visa Consultant'}</p>
                  <div className="flex items-center justify-center mt-4 space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">Certified Professional</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <div style={{ margin: '30px 0' }}>
        <Script
          id="adsterra-native-banner"
          src="//pl28109920.effectivegatecpm.com/35d475c00efb91f3917f80c5594b9b0d/invoke.js"
          strategy="afterInteractive"
          data-cfasync="false"
        />
        <div id="container-35d475c00efb91f3917f80c5594b9b0d"></div>
      </div>



      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200" variant="secondary">
              <Users className="w-3 h-3 mr-1" />
              About Hadi
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Trusted Education Consultant
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              With over 10 years of experience in international education consulting,
              I've helped hundreds of students achieve their dream of studying abroad.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 group border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="text-center">
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Award className="w-8 h-8 text-primary" />
                  </motion.div>
                  <CardTitle className="text-xl">Certified Consultant</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 leading-relaxed">
                    Certified education consultant with specialized training in visa applications
                    and international admissions.
                  </p>
                  <div className="mt-4 flex items-center justify-center text-sm text-primary font-medium">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verified Professional
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 group border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="text-center">
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:from-green-200 group-hover:to-green-100 transition-all duration-300"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                  >
                    <Users className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <CardTitle className="text-xl">500+ Success Stories</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 leading-relaxed">
                    Successfully placed over 500 students in top universities across
                    15+ countries worldwide.
                  </p>
                  <div className="mt-4 flex items-center justify-center text-sm text-green-600 font-medium">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Growing Network
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 group border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="text-center">
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:from-blue-200 group-hover:to-blue-100 transition-all duration-300"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Globe className="w-8 h-8 text-blue-600" />
                  </motion.div>
                  <CardTitle className="text-xl">Global Network</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 leading-relaxed">
                    Extensive network of university partners and education agents
                    across multiple continents.
                  </p>
                  <div className="mt-4 flex items-center justify-center text-sm text-blue-600 font-medium">
                    <Shield className="w-4 h-4 mr-1" />
                    Trusted Partners
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-purple-100 text-purple-800 hover:bg-purple-200" variant="secondary">
              <GraduationCap className="w-3 h-3 mr-1" />
              Our Services
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Support for Your Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From application to arrival, we provide end-to-end support for your study abroad dreams
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-500 group border-0 shadow-lg bg-gradient-to-br from-white to-green-50 hover:from-green-50 hover:to-green-100">
                <CardHeader className="text-center">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 6 }}
                  >
                    <FileText className="w-10 h-10 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl mb-2">Study Visa Assistance</CardTitle>
                  <CardDescription className="text-base">
                    Complete guidance for student visa applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-gray-600 mb-6">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                      Document preparation & review
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                      Application filing & tracking
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                      Interview preparation & coaching
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                      Real-time status updates
                    </li>
                  </ul>
                  <div className="text-center">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                      <Shield className="w-3 h-3 mr-1" />
                      98% Success Rate
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-500 group border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 hover:from-blue-50 hover:to-blue-100">
                <CardHeader className="text-center">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 6 }}
                  >
                    <GraduationCap className="w-10 h-10 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl mb-2">Admission Assistance</CardTitle>
                  <CardDescription className="text-base">
                    Expert help with university applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-gray-600 mb-6">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                      University selection & shortlisting
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                      Application form completion
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                      Essay & SOP editing
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                      Follow-up & communication support
                    </li>
                  </ul>
                  <div className="text-center">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      <Trophy className="w-3 h-3 mr-1" />
                      Top Universities
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-500 group border-0 shadow-lg bg-gradient-to-br from-white to-yellow-50 hover:from-yellow-50 hover:to-yellow-100">
                <CardHeader className="text-center">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 6 }}
                  >
                    <DollarSign className="w-10 h-10 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl mb-2">Scholarship Guidance</CardTitle>
                  <CardDescription className="text-base">
                    Find and secure financial aid opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-gray-600 mb-6">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-yellow-600 flex-shrink-0" />
                      Scholarship search & matching
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-yellow-600 flex-shrink-0" />
                      Application assistance
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-yellow-600 flex-shrink-0" />
                      Financial planning advice
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-yellow-600 flex-shrink-0" />
                      Funding strategy development
                    </li>
                  </ul>
                  <div className="text-center">
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                      <Star className="w-3 h-3 mr-1" />
                      $1M+ Secured
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Countries */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Study Destinations
            </h2>
            <p className="text-xl text-gray-600">
              Explore opportunities in top study abroad destinations
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {studyPages.length > 0 ? (
              studyPages.map((page, index) => (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="group"
                >
                  <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer bg-gradient-to-br from-white to-gray-50">
                    <div className="relative h-56 overflow-hidden">
                      {page.bannerUrl ? (
                        <div className="relative w-full h-full">
                          <img
                            src={page.bannerUrl}
                            alt={page.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                          <div className="text-6xl">🌍</div>
                        </div>
                      )}

                      {/* Floating badges */}
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 backdrop-blur-sm text-black px-3 py-1 shadow-lg">
                          <Star className="w-3 h-3 mr-1 text-yellow-500" />
                          Featured
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-primary/90 backdrop-blur-sm text-white px-3 py-1 shadow-lg">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Popular
                        </Badge>
                      </div>

                      {/* Country flag overlay */}
                      <div className="absolute bottom-4 left-4">
                        <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-2xl">🌍</span>
                        </div>
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-300 mb-2">
                            {page.title}
                          </CardTitle>
                          <CardDescription className="text-gray-600 line-clamp-2 leading-relaxed">
                            {page.description || 'Discover amazing opportunities to study in this beautiful country'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>Europe</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            <span>Popular</span>
                          </div>
                        </div>
                      </div>

                      <Link href={`/study/${page.slug}`}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
                            <span className="mr-2">Explore Opportunities</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                          </Button>
                        </motion.div>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <motion.div
                className="col-span-full text-center py-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="max-w-2xl mx-auto">
                  <motion.div
                    className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Globe className="w-12 h-12 text-primary" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    No Study Destinations Available
                  </h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    We're currently updating our study destinations. Please check back soon or contact us directly
                    to learn about available opportunities for studying abroad.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/contact">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300">
                          <Mail className="w-4 h-4 mr-2" />
                          Contact for Information
                        </Button>
                      </motion.div>
                    </Link>
                    <Link href="/admin/login">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="outline" className="border-2 border-primary/20 hover:border-primary hover:bg-primary hover:text-white transition-all duration-300">
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Access
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          {studyPages.length > 0 && (
            <div className="text-center mt-12">
              <Link href="/study">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  View All Destinations
                  <Globe className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />


      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Study Abroad Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Let's turn your dream of studying abroad into reality
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                <Mail className="w-4 h-4 mr-2" />
                Get Started Today
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-black border-white hover:bg-white hover:text-primary">
                Schedule Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">{siteSettings?.siteName || 'Study Abroad with Hadi'}</h3>
              <p className="text-gray-400 text-sm">
                {siteSettings?.aboutContent || 'Your trusted partner for international education and visa consulting.'}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/study" className="hover:text-white transition-colors">Study Destinations</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/lucky-draw" className="hover:text-white transition-colors">Lucky Draw</Link></li>
                <li><Link href="/b2b" className="hover:text-white transition-colors">B2B Partnerships</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Study Visa Assistance</li>
                <li>Admission Help</li>
                <li>Scholarship Guidance</li>
                <li>University Selection</li>
                <li>Document Preparation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Contact Info</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {siteSettings?.contactEmail || 'info@studyabroadwithhadi.info'}
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {siteSettings?.contactPhone || '+1-234-567-8900'}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {siteSettings?.address || '123 Education Street, Learning City'}
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
              <p>&copy; 2024 {siteSettings?.siteName || 'Study Abroad with Hadi'}. All rights reserved.</p>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Available 24/7
                </span>
                <span className="flex items-center">
                  <Heart className="w-4 h-4 mr-1 text-red-500" />
                  Made with passion
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}