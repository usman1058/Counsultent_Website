'use client'

import { useState, useEffect } from 'react'
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
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  Handshake, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Mail,
  Phone,
  Building,
  Globe,
  Calendar,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface B2BSubmission {
  id: number
  name: string
  company: string
  email: string
  phone: string
  country: string
  message: string
  createdAt: string
  status?: 'new' | 'reviewed' | 'interested' | 'partnered' | 'rejected'
}

export default function AdminB2BPage() {
  const [submissions, setSubmissions] = useState<B2BSubmission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<B2BSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [countryFilter, setCountryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedSubmission, setSelectedSubmission] = useState<B2BSubmission | null>(null)
  const [statusUpdating, setStatusUpdating] = useState<number | null>(null)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  useEffect(() => {
    filterSubmissions()
  }, [submissions, searchTerm, countryFilter, statusFilter])

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/b2b')
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data)
      }
    } catch (error) {
      toast.error('Failed to fetch B2B submissions')
    } finally {
      setLoading(false)
    }
  }

  const filterSubmissions = () => {
    let filtered = submissions

    if (searchTerm) {
      filtered = filtered.filter(submission =>
        submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (countryFilter !== 'all') {
      filtered = filtered.filter(submission => submission.country === countryFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => submission.status === statusFilter)
    }

    setFilteredSubmissions(filtered)
  }

  const updateSubmissionStatus = async (submissionId: number, status: string) => {
    setStatusUpdating(submissionId)
    try {
      const response = await fetch(`/api/b2b/${submissionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        setSubmissions(prev => 
          prev.map(submission => 
            submission.id === submissionId 
              ? { ...submission, status: status as any }
              : submission
          )
        )
        toast.success('B2B submission status updated successfully')
      }
    } catch (error) {
      toast.error('Failed to update submission status')
    } finally {
      setStatusUpdating(null)
    }
  }

  const exportToCSV = () => {
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Country', 'Message', 'Date', 'Status']
    const csvContent = [
      headers.join(','),
      ...filteredSubmissions.map(submission => [
        submission.name,
        submission.company,
        submission.email,
        submission.phone,
        submission.country,
        `"${submission.message.replace(/"/g, '""')}"`,
        new Date(submission.createdAt).toLocaleDateString(),
        submission.status || 'new'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `b2b_submissions_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status?: string) => {
    const statusConfig = {
      new: { label: 'New', className: 'bg-blue-100 text-blue-800' },
      reviewed: { label: 'Reviewed', className: 'bg-yellow-100 text-yellow-800' },
      interested: { label: 'Interested', className: 'bg-purple-100 text-purple-800' },
      partnered: { label: 'Partnered', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const getUniqueCountries = () => {
    const countries = [...new Set(submissions.map(s => s.country))]
    return countries.sort()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">B2B Requests</h1>
          <p className="text-gray-600">Manage partnership inquiries and collaborations</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Handshake className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold">{submissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New</p>
                <p className="text-2xl font-bold">
                  {submissions.filter(s => !s.status || s.status === 'new').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reviewed</p>
                <p className="text-2xl font-bold">
                  {submissions.filter(s => s.status === 'reviewed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Partnered</p>
                <p className="text-2xl font-bold">
                  {submissions.filter(s => s.status === 'partnered').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {getUniqueCountries().map(country => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="interested">Interested</SelectItem>
                <SelectItem value="partnered">Partnered</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setCountryFilter('all')
                setStatusFilter('all')
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Partnership Submissions ({filteredSubmissions.length})</CardTitle>
          <CardDescription>
            Manage and respond to B2B partnership inquiries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-8">
              <Handshake className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
              <p className="text-gray-500">
                {searchTerm || countryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No B2B submissions yet'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-2 text-gray-400" />
                          {submission.company}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{submission.name}</p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {submission.phone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {submission.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 mr-2 text-gray-400" />
                          {submission.country}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={submission.status || 'new'}
                          onValueChange={(value) => updateSubmissionStatus(submission.id, value)}
                          disabled={statusUpdating === submission.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="interested">Interested</SelectItem>
                            <SelectItem value="partnered">Partnered</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedSubmission(submission)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Partnership Details</DialogTitle>
                              <DialogDescription>
                                Full information about this partnership inquiry
                              </DialogDescription>
                            </DialogHeader>
                            {selectedSubmission && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Company Name</Label>
                                    <p className="font-medium">{selectedSubmission.company}</p>
                                  </div>
                                  <div>
                                    <Label>Contact Person</Label>
                                    <p className="font-medium">{selectedSubmission.name}</p>
                                  </div>
                                  <div>
                                    <Label>Email</Label>
                                    <p className="font-medium">{selectedSubmission.email}</p>
                                  </div>
                                  <div>
                                    <Label>Phone</Label>
                                    <p className="font-medium">{selectedSubmission.phone}</p>
                                  </div>
                                  <div>
                                    <Label>Country</Label>
                                    <div className="flex items-center mt-1">
                                      <Globe className="w-4 h-4 mr-2 text-gray-400" />
                                      <p className="font-medium">{selectedSubmission.country}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Status</Label>
                                    <div className="mt-1">
                                      {getStatusBadge(selectedSubmission.status)}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <Label>Message/Proposal</Label>
                                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                    <p className="whitespace-pre-wrap">{selectedSubmission.message}</p>
                                  </div>
                                </div>
                                <div>
                                  <Label>Submitted Date</Label>
                                  <p className="font-medium">
                                    {new Date(selectedSubmission.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}