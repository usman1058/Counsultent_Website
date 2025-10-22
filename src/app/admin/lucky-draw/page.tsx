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
import { 
  Switch
} from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Gift, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Mail,
  Phone,
  Globe,
  Calendar,
  Trophy,
  Users,
  Crown,
  Dice1
} from 'lucide-react'
import { toast } from 'sonner'

interface LuckyDrawEntry {
  id: number
  name: string
  email: string
  phone: string
  country: string
  reason: string
  createdAt: string
  isWinner?: boolean
}

export default function AdminLuckyDrawPage() {
  const [entries, setEntries] = useState<LuckyDrawEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<LuckyDrawEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [countryFilter, setCountryFilter] = useState<string>('all')
  const [winnerFilter, setWinnerFilter] = useState<string>('all')
  const [selectedEntry, setSelectedEntry] = useState<LuckyDrawEntry | null>(null)
  const [isDrawActive, setIsDrawActive] = useState(true)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentWinner, setCurrentWinner] = useState<LuckyDrawEntry | null>(null)
  const [winnerHistory, setWinnerHistory] = useState<LuckyDrawEntry[]>([])

  useEffect(() => {
    fetchEntries()
  }, [])

  useEffect(() => {
    filterEntries()
  }, [entries, searchTerm, countryFilter, winnerFilter])

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/lucky-draw')
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      }
    } catch (error) {
      toast.error('Failed to fetch lucky draw entries')
    } finally {
      setLoading(false)
    }
  }

  const filterEntries = () => {
    let filtered = entries

    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.reason.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (countryFilter !== 'all') {
      filtered = filtered.filter(entry => entry.country === countryFilter)
    }

    if (winnerFilter !== 'all') {
      if (winnerFilter === 'winners') {
        filtered = filtered.filter(entry => entry.isWinner)
      } else if (winnerFilter === 'participants') {
        filtered = filtered.filter(entry => !entry.isWinner)
      }
    }

    setFilteredEntries(filtered)
  }

  const selectRandomWinner = async () => {
    if (entries.length === 0) {
      toast.error('No entries available for drawing')
      return
    }

    setIsDrawing(true)
    
    // Simulate drawing animation
    let iterations = 0
    const maxIterations = 20
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * entries.length)
      setCurrentWinner(entries[randomIndex])
      iterations++
      
      if (iterations >= maxIterations) {
        clearInterval(interval)
        const finalWinner = entries[Math.floor(Math.random() * entries.length)]
        setCurrentWinner(finalWinner)
        
        // Mark as winner in database
        markAsWinner(finalWinner.id)
        setIsDrawing(false)
      }
    }, 100)
  }

  const markAsWinner = async (entryId: number) => {
    try {
      const response = await fetch(`/api/lucky-draw/${entryId}/winner`, {
        method: 'PATCH'
      })

      if (response.ok) {
        const result = await response.json()
        setEntries(prev => 
          prev.map(entry => 
            entry.id === entryId 
              ? { ...entry, isWinner: true }
              : entry
          )
        )
        setWinnerHistory(prev => [...prev, result.winner])
        toast.success(`🎉 Winner selected: ${result.winner.name}!`)
      }
    } catch (error) {
      toast.error('Failed to mark winner')
    }
  }

  const resetDraw = async () => {
    try {
      const response = await fetch('/api/lucky-draw/reset', {
        method: 'POST'
      })

      if (response.ok) {
        setEntries(prev => 
          prev.map(entry => ({ ...entry, isWinner: false }))
        )
        setCurrentWinner(null)
        setWinnerHistory([])
        toast.success('Lucky draw has been reset')
      }
    } catch (error) {
      toast.error('Failed to reset lucky draw')
    }
  }

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Country', 'Reason', 'Date', 'Winner']
    const csvContent = [
      headers.join(','),
      ...filteredEntries.map(entry => [
        entry.name,
        entry.email,
        entry.phone,
        entry.country,
        `"${entry.reason.replace(/"/g, '""')}"`,
        new Date(entry.createdAt).toLocaleDateString(),
        entry.isWinner ? 'Yes' : 'No'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lucky_draw_entries_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getUniqueCountries = () => {
    const countries = [...new Set(entries.map(e => e.country))]
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
          <h1 className="text-3xl font-bold text-gray-900">Lucky Draw Management</h1>
          <p className="text-gray-600">Manage contest entries and select winners</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="draw-active">Contest Active</Label>
            <Switch
              id="draw-active"
              checked={isDrawActive}
              onCheckedChange={setIsDrawActive}
            />
          </div>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold">{entries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Countries</p>
                <p className="text-2xl font-bold">{getUniqueCountries().length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Winners</p>
                <p className="text-2xl font-bold">
                  {entries.filter(e => e.isWinner).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Gift className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-2xl font-bold">
                  {isDrawActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Winner Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Dice1 className="w-5 h-5 mr-2" />
            Winner Selection
          </CardTitle>
          <CardDescription>
            Select a random winner from all participants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={selectRandomWinner}
                disabled={isDrawing || entries.length === 0 || !isDrawActive}
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                {isDrawing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Drawing...
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4 mr-2" />
                    Select Random Winner
                  </>
                )}
              </Button>
              <Button
                onClick={resetDraw}
                variant="outline"
                disabled={isDrawing}
              >
                Reset Draw
              </Button>
            </div>

            {currentWinner && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Crown className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      🎉 Current Winner: {currentWinner.name}
                    </h3>
                    <p className="text-gray-600">
                      {currentWinner.email} • {currentWinner.country}
                    </p>
                    {currentWinner.isWinner && (
                      <Badge className="mt-2 bg-green-100 text-green-800">
                        Official Winner
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
                placeholder="Search entries..."
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
            <Select value={winnerFilter} onValueChange={setWinnerFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entries</SelectItem>
                <SelectItem value="participants">Participants</SelectItem>
                <SelectItem value="winners">Winners</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setCountryFilter('all')
                setWinnerFilter('all')
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lucky Draw Entries ({filteredEntries.length})</CardTitle>
          <CardDescription>
            View and manage all contest participants
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No entries found</h3>
              <p className="text-gray-500">
                {searchTerm || countryFilter !== 'all' || winnerFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No lucky draw entries yet'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id} className={entry.isWinner ? 'bg-yellow-50' : ''}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {entry.isWinner && <Crown className="w-4 h-4 mr-2 text-yellow-600" />}
                          {entry.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {entry.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {entry.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 mr-2 text-gray-400" />
                          {entry.country}
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.isWinner ? (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Crown className="w-3 h-3 mr-1" />
                            Winner
                          </Badge>
                        ) : (
                          <Badge variant="outline">Participant</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedEntry(entry)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Entry Details</DialogTitle>
                              <DialogDescription>
                                Full information about this lucky draw entry
                              </DialogDescription>
                            </DialogHeader>
                            {selectedEntry && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Name</Label>
                                    <p className="font-medium">{selectedEntry.name}</p>
                                  </div>
                                  <div>
                                    <Label>Email</Label>
                                    <p className="font-medium">{selectedEntry.email}</p>
                                  </div>
                                  <div>
                                    <Label>Phone</Label>
                                    <p className="font-medium">{selectedEntry.phone}</p>
                                  </div>
                                  <div>
                                    <Label>Country</Label>
                                    <div className="flex items-center mt-1">
                                      <Globe className="w-4 h-4 mr-2 text-gray-400" />
                                      <p className="font-medium">{selectedEntry.country}</p>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <Label>Why they want to study abroad</Label>
                                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                    <p className="whitespace-pre-wrap">{selectedEntry.reason}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Submitted Date</Label>
                                    <p className="font-medium">
                                      {new Date(selectedEntry.createdAt).toLocaleString()}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Status</Label>
                                    <div className="mt-1">
                                      {selectedEntry.isWinner ? (
                                        <Badge className="bg-yellow-100 text-yellow-800">
                                          <Crown className="w-3 h-3 mr-1" />
                                          Winner
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline">Participant</Badge>
                                      )}
                                    </div>
                                  </div>
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