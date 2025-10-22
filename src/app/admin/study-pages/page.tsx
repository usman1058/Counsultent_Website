'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Globe,
  FileText,
  Save,
  X,
  Copy,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import ImageUpload from '@/components/ui/image-upload'

interface StudyPage {
  id: number
  title: string
  slug: string
  description: string
  bannerUrl: string | null
  seoTitle: string | null
  seoDescription: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    categories: number
    cards: number
  }
}

export default function StudyPagesManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [studyPages, setStudyPages] = useState<StudyPage[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<StudyPage | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    bannerUrl: '',
    seoTitle: '',
    seoDescription: '',
    isActive: true
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchStudyPages()
    }
  }, [session])

  const fetchStudyPages = async () => {
    try {
      const response = await fetch('/api/admin/study-pages')
      if (response.ok) {
        const data = await response.json()
        setStudyPages(data)
      }
    } catch (error) {
      toast.error('Failed to fetch study pages')
    } finally {
      setLoading(false)
    }
  }


  const refreshStudyPages = async () => {
    setRefreshing(true)
    await fetchStudyPages()
    setRefreshing(false)
    toast.success('Study pages refreshed')
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingPage
        ? `/api/admin/study-pages/${editingPage.id}`
        : '/api/admin/study-pages'

      const method = editingPage ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingPage ? 'Study page updated successfully' : 'Study page created successfully')
        setIsCreateModalOpen(false)
        setEditingPage(null)
        setFormData({
          title: '',
          slug: '',
          description: '',
          bannerUrl: '',
          seoTitle: '',
          seoDescription: '',
          isActive: true
        })
        fetchStudyPages()
      } else {
        toast.error('Failed to save study page')
      }
    } catch (error) {
      toast.error('Failed to save study page')
    }
  }

  const handleEdit = (page: StudyPage) => {
    setEditingPage(page)
    setFormData({
      title: page.title,
      slug: page.slug,
      description: page.description,
      bannerUrl: page.bannerUrl || '',
      seoTitle: page.seoTitle || '',
      seoDescription: page.seoDescription || '',
      isActive: page.isActive
    })
    setIsCreateModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this study page? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/study-pages/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Study page deleted successfully')
        fetchStudyPages()
      } else {
        toast.error('Failed to delete study page')
      }
    } catch (error) {
      toast.error('Failed to delete study page')
    }
  }

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/study-pages/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        toast.success(`Study page ${isActive ? 'activated' : 'deactivated'} successfully`)
        fetchStudyPages()
      } else {
        toast.error('Failed to update study page status')
      }
    } catch (error) {
      toast.error('Failed to update study page status')
    }
  }

  const duplicatePage = async (page: StudyPage) => {
    try {
      const response = await fetch(`/api/admin/study-pages/${page.id}/duplicate`, {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Study page duplicated successfully')
        fetchStudyPages()
      } else {
        toast.error('Failed to duplicate study page')
      }
    } catch (error) {
      toast.error('Failed to duplicate study page')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Study Pages Management</h1>
          <p className="text-gray-600">Manage study destination pages and content</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refreshStudyPages}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Study Page
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pages</p>
                <p className="text-2xl font-bold">{studyPages.length}</p>
              </div>
              <Globe className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Pages</p>
                <p className="text-2xl font-bold">{studyPages.filter(p => p.isActive).length}</p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold">{studyPages.reduce((acc, page) => acc + page._count.categories, 0)}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Cards</p>
                <p className="text-2xl font-bold">
                  {studyPages.reduce(
                    (acc, page) => acc + (page._count?.cards ?? 0),
                    0
                  )}
                </p>
              </div>
              <FileText className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Study Pages List */}
      <Card>
        <CardHeader>
          <CardTitle>Study Pages</CardTitle>
          <CardDescription>Manage your study destination pages</CardDescription>
        </CardHeader>
        <CardContent>
          {studyPages.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No study pages found</h3>
              <p className="text-gray-600 mb-4">Create your first study page to get started</p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Study Page
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {studyPages.map((page) => (
                <div key={page.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium">{page.title}</h3>
                        <Badge variant={page.isActive ? 'default' : 'secondary'}>
                          {page.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{page.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Slug: /study/{page.slug}</span>
                        <span>{page._count.categories} categories</span>
                        <span>{page._count.cards} cards</span>
                        <span>Created: {new Date(page.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/study/${page.slug}`} target="_blank">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(page.id, !page.isActive)}
                      >
                        {page.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => duplicatePage(page)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(page)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(page.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingPage ? 'Edit Study Page' : 'Create Study Page'}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setEditingPage(null)
                  setFormData({
                    title: '',
                    slug: '',
                    description: '',
                    bannerUrl: '',
                    seoTitle: '',
                    seoDescription: '',
                    isActive: true
                  })
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g., Study in Italy"
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="study-in-italy"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the study destination"
                  required
                />
              </div>

              <div>
                <Label>Banner Image</Label>
                <ImageUpload
                  value={formData.bannerUrl}
                  onChange={(url) => setFormData(prev => ({ ...prev, bannerUrl: url || '' }))}
                  placeholder="Upload a banner image or enter URL"
                />
              </div>

              <div>
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                  placeholder="SEO title (optional)"
                />
              </div>

              <div>
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                  placeholder="SEO description (optional)"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false)
                    setEditingPage(null)
                    setFormData({
                      title: '',
                      slug: '',
                      description: '',
                      bannerUrl: '',
                      seoTitle: '',
                      seoDescription: '',
                      isActive: true
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  {editingPage ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}