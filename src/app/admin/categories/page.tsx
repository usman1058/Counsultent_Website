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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Edit, 
  Trash2, 
  FolderOpen, 
  FileText,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'
import ImageUpload from '@/components/ui/image-upload'

interface StudyPage {
  id: number
  title: string
  slug: string
}

interface Card {
  id: number
  title: string
  description: string
  imageUrl: string | null
  createdAt: string
}

interface Category {
  id: number
  title: string
  description: string | null
  studyPageId: number
  createdAt: string
  studyPage: StudyPage
  cards: Card[]
}

export default function CategoriesManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [studyPages, setStudyPages] = useState<StudyPage[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCardModalOpen, setIsCardModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [categoryForm, setCategoryForm] = useState({
    title: '',
    description: '',
    studyPageId: ''
  })
  const [cardForm, setCardForm] = useState({
    title: '',
    description: '',
    imageUrl: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchStudyPages()
      fetchCategories()
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
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      toast.error('Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  const toggleCategoryExpansion = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'
      
      const method = editingCategory ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryForm),
      })

      if (response.ok) {
        toast.success(editingCategory ? 'Category updated successfully' : 'Category created successfully')
        setIsCreateModalOpen(false)
        setEditingCategory(null)
        setCategoryForm({ title: '', description: '', studyPageId: '' })
        fetchCategories()
      } else {
        toast.error('Failed to save category')
      }
    } catch (error) {
      toast.error('Failed to save category')
    }
  }

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCategoryId) {
      toast.error('Please select a category first')
      return
    }
    
    try {
      const url = editingCard 
        ? `/api/admin/cards/${editingCard.id}`
        : '/api/admin/cards'
      
      const method = editingCard ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...cardForm,
          categoryId: selectedCategoryId
        }),
      })

      if (response.ok) {
        toast.success(editingCard ? 'Card updated successfully' : 'Card created successfully')
        setIsCardModalOpen(false)
        setEditingCard(null)
        setSelectedCategoryId(null)
        setCardForm({ title: '', description: '', imageUrl: '' })
        fetchCategories()
      } else {
        toast.error('Failed to save card')
      }
    } catch (error) {
      toast.error('Failed to save card')
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryForm({
      title: category.title,
      description: category.description || '',
      studyPageId: category.studyPageId.toString()
    })
    setIsCreateModalOpen(true)
  }

  const handleEditCard = (card: Card, categoryId: number) => {
    setEditingCard(card)
    setSelectedCategoryId(categoryId)
    setCardForm({
      title: card.title,
      description: card.description,
      imageUrl: card.imageUrl || ''
    })
    setIsCardModalOpen(true)
  }

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category and all its cards? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Category deleted successfully')
        fetchCategories()
      } else {
        toast.error('Failed to delete category')
      }
    } catch (error) {
      toast.error('Failed to delete category')
    }
  }

  const handleDeleteCard = async (id: number) => {
    if (!confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/cards/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Card deleted successfully')
        fetchCategories()
      } else {
        toast.error('Failed to delete card')
      }
    } catch (error) {
      toast.error('Failed to delete card')
    }
  }

  const openAddCardModal = (categoryId: number) => {
    setSelectedCategoryId(categoryId)
    setEditingCard(null)
    setCardForm({ title: '', description: '', imageUrl: '' })
    setIsCardModalOpen(true)
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
          <h1 className="text-3xl font-bold">Categories & Cards Management</h1>
          <p className="text-gray-600">Manage content categories and information cards</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <FolderOpen className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Cards</p>
                <p className="text-2xl font-bold">{categories.reduce((acc, cat) => acc + cat.cards.length, 0)}</p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Study Pages</p>
                <p className="text-2xl font-bold">{studyPages.length}</p>
              </div>
              <Eye className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle>Categories & Cards</CardTitle>
          <CardDescription>Manage your content categories and information cards</CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-600 mb-4">Create your first category to get started</p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Category
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="border rounded-lg">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCategoryExpansion(category.id)}
                        >
                          {expandedCategories.has(category.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-medium">{category.title}</h3>
                            <Badge variant="outline">{category.cards.length} cards</Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Page: {category.studyPage.title}
                          </p>
                          {category.description && (
                            <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAddCardModal(category.id)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Card
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {expandedCategories.has(category.id) && (
                    <div className="border-t bg-gray-50 p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Cards in this category</h4>
                      {category.cards.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No cards in this category yet. Click "Add Card" to create one.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {category.cards.map((card) => (
                            <div key={card.id} className="bg-white p-3 rounded border">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h5 className="font-medium text-sm">{card.title}</h5>
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{card.description}</p>
                                  {card.imageUrl && (
                                    <p className="text-xs text-blue-600 mt-1">Has image</p>
                                  )}
                                </div>
                                <div className="flex gap-1 ml-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditCard(card, category.id)}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteCard(card.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Create/Edit Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setEditingCategory(null)
                  setCategoryForm({ title: '', description: '', studyPageId: '' })
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <Label htmlFor="studyPageId">Study Page *</Label>
                <Select
                  value={categoryForm.studyPageId}
                  onValueChange={(value) => setCategoryForm(prev => ({ ...prev, studyPageId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a study page" />
                  </SelectTrigger>
                  <SelectContent>
                    {studyPages.map((page) => (
                      <SelectItem key={page.id} value={page.id.toString()}>
                        {page.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Category Title *</Label>
                <Input
                  id="title"
                  value={categoryForm.title}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Universities"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the category"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false)
                    setEditingCategory(null)
                    setCategoryForm({ title: '', description: '', studyPageId: '' })
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Card Create/Edit Modal */}
      {isCardModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingCard ? 'Edit Card' : 'Create Card'}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsCardModalOpen(false)
                  setEditingCard(null)
                  setSelectedCategoryId(null)
                  setCardForm({ title: '', description: '', imageUrl: '' })
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleCardSubmit} className="space-y-4">
              <div>
                <Label htmlFor="cardTitle">Card Title *</Label>
                <Input
                  id="cardTitle"
                  value={cardForm.title}
                  onChange={(e) => setCardForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., University of Milan"
                  required
                />
              </div>

              <div>
                <Label htmlFor="cardDescription">Description *</Label>
                <Textarea
                  id="cardDescription"
                  value={cardForm.description}
                  onChange={(e) => setCardForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed information about this item"
                  required
                />
              </div>

              <div>
                <Label>Card Image</Label>
                <ImageUpload
                  value={cardForm.imageUrl}
                  onChange={(url) => setCardForm(prev => ({ ...prev, imageUrl: url || '' }))}
                  placeholder="Upload a card image or enter URL"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCardModalOpen(false)
                    setEditingCard(null)
                    setSelectedCategoryId(null)
                    setCardForm({ title: '', description: '', imageUrl: '' })
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  {editingCard ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}