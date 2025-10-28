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
  Eye,
  Info,
  ToggleLeft,
  ToggleRight
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
  description: string // Can be either JSON string or plain text
  imageUrl: string | null
  createdAt: string
  isActive: boolean
  cardCategory: string | null
  duration: string | null
  location: string | null
  intake: string | null
  requirements: string | null
  link: string | null
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
  const [blocks, setBlocks] = useState<Array<{ title: string, value: string, icon: string }>>([]);
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
    description: JSON.stringify([{ type: 'paragraph', content: '' }]), // Default structure
    imageUrl: '',
    cardCategory: '',
    duration: '',
    location: '',
    intake: '',
    requirements: '',
    isActive: true,
    link: ''
  });

  const addBlock = () => {
    setBlocks([...blocks, { title: '', value: '', icon: '' }]);
  };


  const updateBlock = (index: number, field: string, value: string) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], [field]: value };
    setBlocks(newBlocks);
  };

  const removeBlock = (index: number) => {
    const newBlocks = [...blocks];
    newBlocks.splice(index, 1);
    setBlocks(newBlocks);
  };

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
    e.preventDefault();

    if (!selectedCategoryId) {
      toast.error('Please select a category first');
      return;
    }

    try {
      const url = editingCard
        ? `/api/admin/cards/${editingCard.id}`
        : '/api/admin/cards';

      const method = editingCard ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...cardForm,
          categoryId: selectedCategoryId,
          blocks
        }),
      });

      if (response.ok) {
        toast.success(editingCard ? 'Card updated successfully' : 'Card created successfully');
        setIsCardModalOpen(false);
        setEditingCard(null);
        setSelectedCategoryId(null);
        setCardForm({
          title: '',
          description: JSON.stringify([{ type: 'paragraph', content: '' }]),
          imageUrl: '',
          cardCategory: '',
          duration: '',
          location: '',
          intake: '',
          requirements: '',
          isActive: true,
          link: ''
        });
        setBlocks([]);
        fetchCategories();
      } else {
        toast.error('Failed to save card');
      }
    } catch (error) {
      toast.error('Failed to save card');
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryForm({
      title: category.title,
      description: category.description || '',
      studyPageId: category.studyPageId.toString()
    })
    setIsCreateModalOpen(true)
  }

  const handleEditCard = async (card: Card, categoryId: number) => {
    setEditingCard(card)
    setSelectedCategoryId(categoryId)

    // Fetch the card's blocks
    try {
      const response = await fetch(`/api/admin/cards/${card.id}/blocks`);
      if (response.ok) {
        const cardBlocks = await response.json();
        setBlocks(cardBlocks);
      }
    } catch (error) {
      console.error('Failed to fetch card blocks:', error);
      setBlocks([]);
    }

    // Handle description properly - check if it's already JSON or plain text
    let description = card.description;
    try {
      // Try to parse it to see if it's already JSON
      JSON.parse(card.description);
      // If no error, it's already JSON
    } catch (e) {
      // If error, it's plain text, convert to JSON format
      description = JSON.stringify([{ type: 'paragraph', content: card.description }]);
    }

    setCardForm({
      title: card.title,
      description: description,
      imageUrl: card.imageUrl || '',
      cardCategory: card.cardCategory || '',
      duration: card.duration || '',
      location: card.location || '',
      intake: card.intake || '',
      requirements: card.requirements || '',
      isActive: card.isActive,
      link: card.link || ''
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
    setBlocks([])
    setCardForm({
      title: '',
      description: JSON.stringify([{ type: 'paragraph', content: '' }]),
      imageUrl: '',
      cardCategory: '',
      duration: '',
      location: '',
      intake: '',
      requirements: '',
      isActive: true,
      link: ''
    })
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
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className="font-medium text-sm">{card.title}</h5>
                                    {!card.isActive && (
                                      <Badge variant="destructive" className="text-xs">Inactive</Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                    {(() => {
                                      try {
                                        // Try to parse as JSON
                                        if (typeof card.description === 'string') {
                                          const parsed = JSON.parse(card.description);

                                          // If it's an array, get the first item's content
                                          if (Array.isArray(parsed) && parsed.length > 0) {
                                            // Check if the first item has a content property and it's a string
                                            if (parsed[0].content && typeof parsed[0].content === 'string') {
                                              return parsed[0].content;
                                            }
                                            // If content is not a string, convert it to string
                                            if (parsed[0].content) {
                                              return String(parsed[0].content);
                                            }
                                          }

                                          // If it's an object with content property
                                          if (parsed && parsed.content) {
                                            // Ensure content is a string
                                            if (typeof parsed.content === 'string') {
                                              return parsed.content;
                                            }
                                            return String(parsed.content);
                                          }
                                        }

                                        // Fallback to original description if it's a string
                                        if (typeof card.description === 'string') {
                                          return card.description;
                                        }

                                        // If description is not a string, convert it to string
                                        return String(card.description);
                                      } catch (e) {
                                        // If parsing fails, return original description if it's a string
                                        if (typeof card.description === 'string') {
                                          return card.description;
                                        }

                                        // If description is not a string, convert it to string
                                        return String(card.description);
                                      }
                                    })()}
                                  </p>
                                  {card.imageUrl && (
                                    <p className="text-xs text-blue-600 mt-1">Has image</p>
                                  )}
                                  {card.cardCategory && (
                                    <Badge variant="outline" className="text-xs mt-1">{card.cardCategory}</Badge>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">
                    {editingCard ? 'Edit Card' : 'Create New Card'}
                  </h2>
                  <p className="text-blue-100 mt-1">
                    {editingCard ? 'Update card information' : 'Add a new card to your category'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCardModalOpen(false)
                    setEditingCard(null)
                    setSelectedCategoryId(null)
                    setCardForm({
                      title: '',
                      description: JSON.stringify([{ type: 'paragraph', content: '' }]),
                      imageUrl: '',
                      cardCategory: '',
                      duration: '',
                      location: '',
                      intake: '',
                      requirements: '',
                      isActive: true,
                      link: ''
                    })
                    setBlocks([])
                  }}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Modal Body with Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleCardSubmit} className="space-y-8">
                {/* Basic Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="cardTitle" className="text-gray-700 font-medium">Card Title *</Label>
                      <Input
                        id="cardTitle"
                        value={cardForm.title}
                        onChange={(e) => setCardForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., University of Milan"
                        required
                        className="mt-2 h-12"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cardCategory" className="text-gray-700 font-medium">Card Category</Label>
                      <Input
                        id="cardCategory"
                        value={cardForm.cardCategory}
                        onChange={(e) => setCardForm(prev => ({ ...prev, cardCategory: e.target.value }))}
                        placeholder="e.g., Top University"
                        className="mt-2 h-12"
                      />
                    </div>
                  </div>

                  {/* User-friendly Description Editor */}
                  <div>
                    <Label className="text-gray-700 font-medium">Description *</Label>
                    <div className="mt-2 space-y-4">
                      <div>
                        <Label htmlFor="descriptionHeading" className="text-sm text-gray-600">Heading (Optional)</Label>
                        <Input
                          id="descriptionHeading"
                          value={(() => {
                            try {
                              const parsed = JSON.parse(cardForm.description);
                              const heading = parsed.find((item: any) => item.type === 'heading');
                              return heading ? heading.content : '';
                            } catch {
                              return '';
                            }
                          })()}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(cardForm.description);
                              const headingIndex = parsed.findIndex((item: any) => item.type === 'heading');
                              if (headingIndex !== -1) {
                                parsed[headingIndex].content = e.target.value;
                              } else if (e.target.value) {
                                parsed.unshift({ type: 'heading', content: e.target.value });
                              }
                              setCardForm(prev => ({ ...prev, description: JSON.stringify(parsed) }));
                            } catch {
                              setCardForm(prev => ({
                                ...prev,
                                description: JSON.stringify([{ type: 'heading', content: e.target.value }, { type: 'paragraph', content: '' }])
                              }));
                            }
                          }}
                          placeholder="e.g., Program Overview"
                          className="h-12"
                        />
                      </div>

                      <div>
                        <Label htmlFor="descriptionParagraph" className="text-sm text-gray-600">Main Description *</Label>
                        <Textarea
                          id="descriptionParagraph"
                          value={(() => {
                            try {
                              const parsed = JSON.parse(cardForm.description);
                              const paragraph = parsed.find((item: any) => item.type === 'paragraph');
                              return paragraph ? paragraph.content : '';
                            } catch {
                              return cardForm.description;
                            }
                          })()}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(cardForm.description);
                              const paragraphIndex = parsed.findIndex((item: any) => item.type === 'paragraph');
                              if (paragraphIndex !== -1) {
                                parsed[paragraphIndex].content = e.target.value;
                              } else {
                                parsed.push({ type: 'paragraph', content: e.target.value });
                              }
                              setCardForm(prev => ({ ...prev, description: JSON.stringify(parsed) }));
                            } catch {
                              setCardForm(prev => ({
                                ...prev,
                                description: JSON.stringify([{ type: 'paragraph', content: e.target.value }])
                              }));
                            }
                          }}
                          placeholder="Enter a detailed description of the program"
                          rows={4}
                          required
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="descriptionList" className="text-sm text-gray-600">Key Points (Optional)</Label>
                        <Textarea
                          id="descriptionList"
                          value={(() => {
                            try {
                              const parsed = JSON.parse(cardForm.description);
                              const list = parsed.find((item: any) => item.type === 'list');
                              return list ? list.items.join('\n') : '';
                            } catch {
                              return '';
                            }
                          })()}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(cardForm.description);
                              const listIndex = parsed.findIndex((item: any) => item.type === 'list');
                              const items = e.target.value.split('\n').filter(item => item.trim() !== '');

                              if (listIndex !== -1) {
                                if (items.length > 0) {
                                  parsed[listIndex].items = items;
                                } else {
                                  parsed.splice(listIndex, 1);
                                }
                              } else if (items.length > 0) {
                                parsed.push({ type: 'list', items });
                              }

                              setCardForm(prev => ({ ...prev, description: JSON.stringify(parsed) }));
                            } catch {
                              const items = e.target.value.split('\n').filter(item => item.trim() !== '');
                              if (items.length > 0) {
                                setCardForm(prev => ({
                                  ...prev,
                                  description: JSON.stringify([{ type: 'list', items }])
                                }));
                              }
                            }
                          }}
                          placeholder="Enter key points, one per line"
                          rows={3}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Details Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Additional Details</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="duration" className="text-gray-700 font-medium">Duration</Label>
                      <Input
                        id="duration"
                        value={cardForm.duration}
                        onChange={(e) => setCardForm(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="e.g., 4 years"
                        className="mt-2 h-12"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location" className="text-gray-700 font-medium">Location</Label>
                      <Input
                        id="location"
                        value={cardForm.location}
                        onChange={(e) => setCardForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="e.g., Milan, Italy"
                        className="mt-2 h-12"
                      />
                    </div>

                    <div>
                      <Label htmlFor="intake" className="text-gray-700 font-medium">Intake Periods</Label>
                      <Input
                        id="intake"
                        value={cardForm.intake}
                        onChange={(e) => setCardForm(prev => ({ ...prev, intake: e.target.value }))}
                        placeholder="e.g., Fall & Spring"
                        className="mt-2 h-12"
                      />
                    </div>

                    <div>
                      <Label htmlFor="link" className="text-gray-700 font-medium">Button Link</Label>
                      <Input
                        id="link"
                        value={cardForm.link}
                        onChange={(e) => setCardForm(prev => ({ ...prev, link: e.target.value }))}
                        placeholder="https://example.com"
                        className="mt-2 h-12"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="requirements" className="text-gray-700 font-medium">Requirements</Label>
                    <Textarea
                      id="requirements"
                      value={cardForm.requirements}
                      onChange={(e) => setCardForm(prev => ({ ...prev, requirements: e.target.value }))}
                      placeholder="Admission requirements"
                      rows={4}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Card Image Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Card Image</h3>
                  </div>

                  <div>
                    <Label className="text-gray-700 font-medium">Card Image</Label>
                    <div className="mt-2">
                      <ImageUpload
                        value={cardForm.imageUrl}
                        onChange={(url) => setCardForm(prev => ({ ...prev, imageUrl: url || '' }))}
                        placeholder="Upload a card image or enter URL"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">4</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Status</h3>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={cardForm.isActive}
                      onChange={(e) => setCardForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <div>
                      <Label htmlFor="isActive" className="text-gray-700 font-medium">Active Status</Label>
                      <p className="text-sm text-gray-500">Show this card to users</p>
                    </div>
                  </div>
                </div>

                {/* Dynamic Blocks Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">5</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Information Blocks</h3>
                    </div>
                    <Button type="button" onClick={addBlock} variant="outline" className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add Block
                    </Button>
                  </div>

                  {blocks.length > 0 ? (
                    <div className="space-y-4">
                      {blocks.map((block, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-900">Block #{index + 1}</h4>
                            <Button
                              type="button"
                              onClick={() => removeBlock(index)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`block-title-${index}`} className="text-gray-700 font-medium">Title</Label>
                              <Input
                                id={`block-title-${index}`}
                                value={block.title}
                                onChange={(e) => updateBlock(index, 'title', e.target.value)}
                                placeholder="e.g., Duration"
                                className="mt-2 h-12"
                              />
                            </div>

                            <div>
                              <Label htmlFor={`block-value-${index}`} className="text-gray-700 font-medium">Value</Label>
                              <Input
                                id={`block-value-${index}`}
                                value={block.value}
                                onChange={(e) => updateBlock(index, 'value', e.target.value)}
                                placeholder="e.g., 4 years"
                                className="mt-2 h-12"
                              />
                            </div>

                            <div>
                              <Label htmlFor={`block-icon-${index}`} className="text-gray-700 font-medium">Icon Class</Label>
                              <Input
                                id={`block-icon-${index}`}
                                value={block.icon}
                                onChange={(e) => updateBlock(index, 'icon', e.target.value)}
                                placeholder="e.g., fas fa-clock"
                                className="mt-2 h-12"
                              />
                              <p className="text-xs text-gray-500 mt-1">Use Font Awesome class (e.g., fas fa-clock)</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                          <Plus className="w-8 h-8 text-gray-500" />
                        </div>
                      </div>
                      <p className="text-gray-500 font-medium">No blocks added yet</p>
                      <p className="text-gray-400 text-sm mt-1">Click "Add Block" to create your first information block</p>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCardModalOpen(false)
                    setEditingCard(null)
                    setSelectedCategoryId(null)
                    setCardForm({
                      title: '',
                      description: JSON.stringify([{ type: 'paragraph', content: '' }]),
                      imageUrl: '',
                      cardCategory: '',
                      duration: '',
                      location: '',
                      intake: '',
                      requirements: '',
                      isActive: true,
                      link: ''
                    })
                    setBlocks([])
                  }}
                  className="px-6 py-3"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onClick={handleCardSubmit}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingCard ? 'Update Card' : 'Create Card'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}