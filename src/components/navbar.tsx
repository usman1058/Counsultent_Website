// components/navbar.tsx

'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  Menu, 
  X, 
  Phone, 
  Mail, 
  ChevronDown,
  GraduationCap,
  Globe,
  Users,
  Gift,
  Handshake,
  Star,
  Plane,
  MapPin,
  Award,
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { motion, AnimatePresence } from 'framer-motion'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [studyPages, setStudyPages] = useState<any[]>([])
  const [siteSettings, setSiteSettings] = useState<any>(null)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const { colors } = useTheme()

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Fetch study pages and site settings
    const fetchData = async () => {
      try {
        const [studyRes, settingsRes] = await Promise.all([
          fetch('/api/study-pages'),
          fetch('/api/admin/settings')
        ])
        
        if (studyRes.ok) {
          const studyData = await studyRes.json()
          setStudyPages(studyData)
        }
        
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json()
          setSiteSettings(settingsData)
        }
      } catch (error) {
        console.error('Failed to fetch navbar data:', error)
      }
    }
    
    fetchData()
  }, [])

  const getCountryIcon = (title: string) => {
    // Dynamic icon selection based on keywords in title
    if (title.toLowerCase().includes('europe') || title.toLowerCase().includes('italy') || title.toLowerCase().includes('uk') || title.toLowerCase().includes('france') || title.toLowerCase().includes('germany') || title.toLowerCase().includes('spain')) {
      return <Plane className="w-4 h-4" />
    }
    if (title.toLowerCase().includes('america') || title.toLowerCase().includes('canada') || title.toLowerCase().includes('usa')) {
      return <MapPin className="w-4 h-4" />
    }
    if (title.toLowerCase().includes('asia') || title.toLowerCase().includes('australia') || title.toLowerCase().includes('china') || title.toLowerCase().includes('japan')) {
      return <Globe className="w-4 h-4" />
    }
    return <GraduationCap className="w-4 h-4" />
  }

  const getCountryFlag = (title: string) => {
    // Dynamic flag selection based on keywords in title
    const flags: Record<string, string> = {
      'italy': '🇮🇹', 'canada': '🇨🇦', 'uk': '🇬🇧', 'usa': '🇺🇸', 'australia': '🇦🇺',
      'germany': '🇩🇪', 'france': '🇫🇷', 'spain': '🇪🇸', 'japan': '🇯🇵', 'china': '🇨🇳',
      'india': '🇮🇳', 'singapore': '🇸🇬', 'malaysia': '🇲🇾', 'uae': '🇦🇪', 'netherlands': '🇳🇱'
    }
    
    const lowerTitle = title.toLowerCase()
    for (const [country, flag] of Object.entries(flags)) {
      if (lowerTitle.includes(country)) {
        return flag
      }
    }
    return '🌍'
  }

  const navItems = [
    {
      title: 'Study Destinations',
      href: '/study',
      icon: <Globe className="w-4 h-4" />,
      description: 'Explore countries and universities',
      hasDropdown: true,
      badge: 'Popular',
      dropdownItems: studyPages.map(page => ({
        title: page.title,
        href: `/study/${page.slug}`,
        icon: getCountryIcon(page.title),
        flag: getCountryFlag(page.title),
        description: page.description?.substring(0, 60) + '...' || 'Explore study opportunities',
        badge: page.bannerUrl ? 'Featured' : null,
        stats: `${page._count?.categories || 0} Categories`
      }))
    },
    {
      title: 'Partners',
      href: '/b2b',
      icon: <Handshake className="w-4 h-4" />,
      description: 'B2B partnerships'
    },
    {
      title: 'Lucky Draw',
      href: '/lucky-draw',
      icon: <Gift className="w-4 h-4" />,
      description: 'Win exciting prizes',
      badge: 'New'
    }
  ]

  if (!mounted) return null

  return (
    <nav className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ${
      scrolled ? 'shadow-lg shadow-primary/5' : ''
    }`}>
      {/* Top Bar */}
      <div className="bg-primary/5 border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-8 text-xs">
            <div className="flex items-center space-x-4">
              <span className="text-primary font-medium flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Certified Consultant
              </span>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">98% Success Rate</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-muted-foreground flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                500+ Students Placed
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div 
              className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <GraduationCap className="w-7 h-7 text-white" />
            </motion.div>
            <div className="flex flex-col">
              <motion.span 
                className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors"
                whileHover={{ x: 2 }}
              >
                {siteSettings?.siteName || 'Study Abroad with Hadi'}
              </motion.span>
              <span className="text-xs text-muted-foreground hidden sm:block">
                Expert Visa Consultant
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <div key={item.title} className="relative group">
                <motion.div
                  onMouseEnter={() => setActiveDropdown(item.title)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className="flex items-center px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg transition-all duration-200 group relative"
                  >
                    <motion.div
                      className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      layoutId="activeTab"
                    />
                    <span className="relative flex items-center">
                      {item.icon}
                      <span className="ml-2">{item.title}</span>
                      {item.badge && (
                        <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {item.hasDropdown && (
                        <motion.div
                          animate={{ rotate: activeDropdown === item.title ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4 ml-1" />
                        </motion.div>
                      )}
                    </span>
                  </Link>
                </motion.div>
                
                {/* Enhanced Dropdown Menu */}
                <AnimatePresence>
                  {item.hasDropdown && activeDropdown === item.title && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-[480px] z-50"
                      onMouseEnter={() => setActiveDropdown(item.title)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <div className="bg-background/95 backdrop-blur-lg border rounded-xl shadow-2xl p-4 border-primary/10">
                        {item.dropdownItems.length > 0 ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between mb-3 pb-2 border-b">
                              <h3 className="font-semibold text-foreground">Study Destinations</h3>
                              <Link href="/study" className="text-xs text-primary hover:underline flex items-center">
                                View All
                                <ArrowRight className="w-3 h-3 ml-1" />
                              </Link>
                            </div>
                            {item.dropdownItems.map((dropdownItem, index) => (
                              <motion.div
                                key={dropdownItem.title}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.1, delay: index * 0.05 }}
                              >
                                <Link
                                  href={dropdownItem.href}
                                  className="flex items-start p-3 rounded-lg hover:bg-primary/10 transition-all duration-200 group/item"
                                >
                                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg mr-3 group-hover/item:from-primary/20 group-hover/item:to-primary/30 transition-all duration-200">
                                    <span className="text-xl">{dropdownItem.flag}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="font-medium text-sm text-foreground group-hover/item:text-primary transition-colors">
                                        {dropdownItem.title}
                                      </div>
                                      {dropdownItem.badge && (
                                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                          {dropdownItem.badge}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground mb-2 line-clamp-2 group-hover/item:text-foreground/80 transition-colors">
                                      {dropdownItem.description}
                                    </div>
                                    <div className="flex items-center text-xs text-primary">
                                      <span className="font-medium">{dropdownItem.stats}</span>
                                      <ArrowRight className="w-3 h-3 ml-1 group-hover/item:translate-x-1 transition-transform duration-200" />
                                    </div>
                                  </div>
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center text-muted-foreground">
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                              <p className="text-sm font-medium">No study destinations available yet</p>
                              <p className="text-xs mt-1">Check back soon for exciting opportunities!</p>
                            </motion.div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Desktop CTA Button */}
            <div className="hidden lg:block">
              <Link href="/contact">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 px-6">
                    <span>Contact Now</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              </Link>
            </div>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="sm" className="h-10 w-10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] overflow-y-auto">
                <div className="flex flex-col space-y-6 mt-8">
                  <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-lg font-bold">Study Abroad with Hadi</span>
                    </Link>
                  </div>

                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      {navItems.map((item) => (
                        <div key={item.title}>
                          <Link
                            href={item.href}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="flex items-center space-x-3">
                              {item.icon}
                              <div>
                                <div className="font-medium flex items-center">
                                  {item.title}
                                  {item.badge && (
                                    <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {item.description}
                                </div>
                              </div>
                            </div>
                            {item.hasDropdown && (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Link>
                          
                          {/* Mobile Dropdown */}
                          {item.hasDropdown && item.dropdownItems && (
                            <div className="ml-4 mt-1 space-y-1">
                              {item.dropdownItems.length > 0 ? (
                                item.dropdownItems.map((dropdownItem) => (
                                  <Link
                                    key={dropdownItem.title}
                                    href={dropdownItem.href}
                                    className="flex items-center p-2 rounded-md hover:bg-accent/50 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                  >
                                    <span className="text-lg mr-2">{dropdownItem.flag}</span>
                                    <div className="flex-1">
                                      <div className="text-sm font-medium">{dropdownItem.title}</div>
                                      <div className="text-xs text-muted-foreground">{dropdownItem.stats}</div>
                                    </div>
                                  </Link>
                                ))
                              ) : (
                                <div className="p-3 text-center text-muted-foreground text-sm">
                                  No destinations available
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Link href="/contact" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-primary hover:bg-primary/90">
                        Contact Now
                      </Button>
                    </Link>
                  </div>

                  <div className="border-t pt-4 space-y-3 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="w-4 h-4 mr-2" />
                      {siteSettings?.contactPhone || '+1-234-567-8900'}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Mail className="w-4 h-4 mr-2" />
                      {siteSettings?.contactEmail || 'info@studyabroadwithhadi.info'}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar