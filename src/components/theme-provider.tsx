// components/theme-provider.tsx

'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface ThemeColors {
  primary: string
  secondary: string
  accent: string
}

interface SiteSettings {
  id: number
  siteName: string
  siteUrl: string
  logoUrl: string | null
  faviconUrl: string | null
  contactEmail: string
  contactPhone: string
  address: string | null
  aboutContent: string | null
  metaTitle: string | null
  metaDescription: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  adminName: string
  adminEmail: string
  adminPhone: string
  adminTitle: string
  adminBio: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ThemeContextType {
  colors: ThemeColors
  settings: SiteSettings | null
  updateColors: (colors: Partial<ThemeColors>) => void
  updateSettings: (settings: Partial<SiteSettings>) => void
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colors, setColors] = useState<ThemeColors>({
    primary: '#3b82f6',
    secondary: '#6366f1',
    accent: '#f59e0b'
  })
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        setColors({
          primary: data.primaryColor,
          secondary: data.secondaryColor,
          accent: data.accentColor
        })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateColors = (newColors: Partial<ThemeColors>) => {
    setColors(prev => ({ ...prev, ...newColors }))
  }

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings(prev => prev ? { ...prev, ...newSettings } : null)
  }

  // Apply colors to CSS variables
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      root.style.setProperty('--primary', colors.primary)
      root.style.setProperty('--secondary', colors.secondary)
      root.style.setProperty('--accent', colors.accent)
    }
  }, [colors])

  // Update page title and meta
  useEffect(() => {
    if (settings && typeof window !== 'undefined') {
      document.title = settings.metaTitle || settings.siteName
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', settings.metaDescription || '')
      }
    }
  }, [settings])

  const value: ThemeContextType = {
    colors,
    settings,
    updateColors,
    updateSettings,
    isLoading
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}