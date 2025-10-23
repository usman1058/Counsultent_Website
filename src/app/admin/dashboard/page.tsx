'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { 
  Users, 
  MessageSquare, 
  Handshake, 
  Gift, 
  TrendingUp,
  FileText,
  Plus,
  Database,
  Globe,
  Trash2
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  contacts: number
  b2bRequests: number
  luckyDrawEntries: number
  studyPages: number
  recentContacts: any[]
  recentB2B: any[]
}

export default function AdminDashboard() {
  const { toast } = useToast()
  const [stats, setStats] = useState<DashboardStats>({
    contacts: 0,
    b2bRequests: 0,
    luckyDrawEntries: 0,
    studyPages: 0,
    recentContacts: [],
    recentB2B: []
  })
  const [loading, setLoading] = useState(true)
  const [creatingSamples, setCreatingSamples] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteAllStudyPages = async () => {
    if (!confirm('Are you sure you want to delete ALL study pages? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/admin/study-pages', {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchStats()
        toast({
          title: "Success",
          description: "All study pages deleted successfully",
        })
      } else {
        throw new Error('Failed to delete study pages')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete study pages",
        variant: "destructive",
      })
    }
  }

  const createSampleStudyPages = async () => {
    setCreatingSamples(true)
    try {
      const templatePages = [
        {
          title: 'Study Destination Template',
          slug: 'study-destination-template',
          description: 'A template for creating study destination pages. Customize this with specific country information.',
          bannerUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=400&fit=crop',
          seoTitle: 'Study Destination Template - Universities, Scholarships & Visa Guide',
          seoDescription: 'Template guide for study destinations. Customize with specific country information, universities, scholarships, visa requirements, and application process.',
          isActive: true
        }
      ]

      let createdCount = 0
      for (const pageData of templatePages) {
        try {
          const response = await fetch('/api/admin/study-pages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(pageData),
          })
          if (response.ok) {
            createdCount++
          }
        } catch (error) {
          console.error('Failed to create template page:', pageData.title)
        }
      }

      if (createdCount > 0) {
        fetchStats() // Refresh stats
        alert(`Successfully created ${createdCount} template page!`)
      } else {
        alert('Failed to create sample pages. They may already exist.')
      }
    } catch (error) {
      console.error('Failed to create sample pages:', error)
      alert('Failed to create sample pages')
    } finally {
      setCreatingSamples(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's an overview of your site.</p>
        </div>
        <Link href="/admin/study-pages">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Destinations
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Requests</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contacts}</div>
            <p className="text-xs text-muted-foreground">
              Total contact submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">B2B Requests</CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.b2bRequests}</div>
            <p className="text-xs text-muted-foreground">
              Partner inquiries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucky Draw Entries</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.luckyDrawEntries}</div>
            <p className="text-xs text-muted-foreground">
              Contest participants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Pages</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.studyPages}</div>
            <p className="text-xs text-muted-foreground">
              Active country pages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Contact Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Contact Requests</CardTitle>
            <CardDescription>
              Latest student inquiries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentContacts.length === 0 ? (
                <p className="text-sm text-gray-500">No contact requests yet</p>
              ) : (
                stats.recentContacts.map((contact: any) => (
                  <div key={contact.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {contact.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {contact.email}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{contact.purpose}</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {stats.recentContacts.length > 0 && (
              <div className="mt-4">
                <Link href="/admin/contacts">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Contacts
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent B2B Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Recent B2B Requests</CardTitle>
            <CardDescription>
              Latest partner inquiries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentB2B.length === 0 ? (
                <p className="text-sm text-gray-500">No B2B requests yet</p>
              ) : (
                stats.recentB2B.map((b2b: any) => (
                  <div key={b2b.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {b2b.company}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {b2b.name}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{b2b.country}</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(b2b.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {stats.recentB2B.length > 0 && (
              <div className="mt-4">
                <Link href="/admin/b2b">
                  <Button variant="outline" size="sm" className="w-full">
                    View All B2B Requests
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks you might want to perform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/study-pages">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Create Study Page
              </Button>
            </Link>
            <Link href="/admin/contacts">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Review Contacts
              </Button>
            </Link>
            <Link href="/admin/lucky-draw">
              <Button variant="outline" className="w-full justify-start">
                <Gift className="h-4 w-4 mr-2" />
                Manage Lucky Draw
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={createSampleStudyPages}
              disabled={creatingSamples}
            >
              <Database className="h-4 w-4 mr-2" />
              {creatingSamples ? 'Creating...' : 'Create Template Page'}
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={deleteAllStudyPages}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All Study Pages
            </Button>
          </div>
          {stats.studyPages === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <Globe className="h-5 w-5 text-yellow-600 mr-2" />
                <div className="text-sm text-yellow-800">
                  <strong>No study pages found!</strong> Create sample data to see the dropdown menu and Popular Study Destinations section in action.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}