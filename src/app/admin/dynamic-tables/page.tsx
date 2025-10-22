'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import { useDynamicTable } from '@/hooks/useDynamicTable'
import TableBuilder from '@/components/admin/table-builder'
import TablePreview from '@/components/admin/table-preview'

export default function DynamicTablesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [detailPageFilter, setDetailPageFilter] = useState<string>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<any>(null)
  const [detailPages, setDetailPages] = useState<any[]>([])

  const { 
    tables, 
    loading, 
    error, 
    pagination, 
    fetchTables, 
    createTable, 
    updateTable, 
    deleteTable 
  } = useDynamicTable({ autoFetch: true })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    fetchDetailPages()
  }, [])

  useEffect(() => {
    fetchTables(currentPage, searchTerm)
  }, [currentPage, searchTerm, detailPageFilter])

  const fetchDetailPages = async () => {
  try {
    // First, get all cards with their categories and study pages
    const cardsResponse = await fetch('/api/admin/cards')
    if (cardsResponse.ok) {
      const cards = await cardsResponse.json()
      
      // Transform the cards data to match what we need for detail pages
      const detailPagesData = cards.map((card: any) => ({
        id: card.id,
        cardId: card.id,
        cardTitle: card.title,
        categoryTitle: card.category.title,
        studyPageTitle: card.category.studyPage.title,
        studyPageSlug: card.category.studyPage.slug
      }))
      
      setDetailPages(detailPagesData)
      console.log('Detail pages loaded:', detailPagesData) // Add this for debugging
    } else {
      console.error('Failed to fetch cards:', cardsResponse.status)
      toast.error('Failed to fetch cards')
    }
  } catch (error) {
    console.error('Error fetching detail pages:', error)
    toast.error('Failed to fetch detail pages')
  }
}

  const handleCreateTable = async (tableData: any) => {
    try {
      await createTable(tableData)
      setIsCreateModalOpen(false)
    } catch (error) {
      // Error is handled in the hook
    }
  }

  const handleEditTable = async (tableData: any) => {
    try {
      await updateTable(selectedTable.id, tableData)
      setIsEditModalOpen(false)
      setSelectedTable(null)
    } catch (error) {
      // Error is handled in the hook
    }
  }

  const handleDeleteTable = async (id: number) => {
    if (!confirm('Are you sure you want to delete this table? This action cannot be undone.')) {
      return
    }

    try {
      await deleteTable(id)
    } catch (error) {
      // Error is handled in the hook
    }
  }

  const handleEditClick = (table: any) => {
    setSelectedTable(table)
    setIsEditModalOpen(true)
  }

  const handlePreviewClick = (table: any) => {
    setSelectedTable(table)
    setIsPreviewModalOpen(true)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const getDetailPageTitle = (detailPageId: number) => {
    const detailPage = detailPages.find(dp => dp.id === detailPageId)
    if (!detailPage) return 'Unknown'
    
    return `${detailPage.cardTitle} - ${detailPage.categoryTitle} (${detailPage.studyPageTitle})`
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
          <h1 className="text-3xl font-bold">Dynamic Tables</h1>
          <p className="text-gray-600">Manage dynamic tables for detail pages</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Table
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tables</p>
                <p className="text-2xl font-bold">{pagination?.total || 0}</p>
              </div>
              <TableIcon className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Detail Pages</p>
                <p className="text-2xl font-bold">{detailPages.length}</p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Rows</p>
                <p className="text-2xl font-bold">
                  {tables.reduce((acc, table) => acc + (Array.isArray(table.rows) ? table.rows.length : 0), 0)}
                </p>
              </div>
              <Plus className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={detailPageFilter} onValueChange={setDetailPageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by detail page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Detail Pages</SelectItem>
                {detailPages.map((detailPage) => (
                  <SelectItem key={detailPage.id} value={detailPage.id.toString()}>
                    {detailPage.cardTitle} - {detailPage.categoryTitle} ({detailPage.studyPageTitle})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setDetailPageFilter('all')
                setCurrentPage(1)
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tables List */}
      <Card>
        <CardHeader>
          <CardTitle>Dynamic Tables ({pagination?.total || 0})</CardTitle>
          <CardDescription>
            Manage dynamic tables for your detail pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tables.length === 0 ? (
            <div className="text-center py-8">
              <TableIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tables found</h3>
              <p className="text-gray-600 mb-4">Create your first table to get started</p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Table
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Detail Page</TableHead>
                      <TableHead>Columns</TableHead>
                      <TableHead>Rows</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tables.map((table) => (
                      <TableRow key={table.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {table.iconUrl && (
                              <img 
                                src={table.iconUrl} 
                                alt={table.title}
                                className="w-6 h-6 mr-2 rounded"
                              />
                            )}
                            {table.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getDetailPageTitle(table.detailPageId)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {Array.isArray(table.columns) ? table.columns.length : 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {Array.isArray(table.rows) ? table.rows.length : 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(table.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(table.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditClick(table)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePreviewClick(table)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteTable(table.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Table Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Dynamic Table</DialogTitle>
            <DialogDescription>
              Create a new dynamic table with custom columns and rows
            </DialogDescription>
          </DialogHeader>
          <TableBuilder
            detailPages={detailPages}
            onSave={handleCreateTable}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Table Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Dynamic Table</DialogTitle>
            <DialogDescription>
              Update the dynamic table with new columns and rows
            </DialogDescription>
          </DialogHeader>
          {selectedTable && (
            <TableBuilder
              detailPages={detailPages}
              initialData={selectedTable}
              onSave={handleEditTable}
              onCancel={() => {
                setIsEditModalOpen(false)
                setSelectedTable(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Table Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Table Preview</DialogTitle>
            <DialogDescription>
              This is how your table will appear on the public site
            </DialogDescription>
          </DialogHeader>
          {selectedTable && (
            <TablePreview
              title={selectedTable.title}
              description={selectedTable.description}
              columns={selectedTable.columns}
              rows={selectedTable.rows}
              iconUrl={selectedTable.iconUrl}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}