'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  ExternalLink,
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'

interface DynamicTableProps {
  columns: Array<{ name: string; type: string }>
  rows: Array<Record<string, any>>
}

export default function DynamicTable({ columns, rows }: DynamicTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter rows based on search term
  const filteredRows = rows.filter(row =>
    Object.values(row).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRows = filteredRows.slice(startIndex, startIndex + itemsPerPage)

  const renderCellContent = (value: any, type: string) => {
    if (!value) return '-'

    switch (type) {
      case 'link':
        return (
          <Button variant="link" size="sm" asChild>
            <a 
              href={value} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center"
            >
              Apply
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </Button>
        )
      
      case 'image':
        return (
          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
            {value.startsWith('http') ? (
              <img 
                src={value} 
                alt="Logo" 
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                }}
              />
            ) : null}
            <span className="text-xs text-gray-500 hidden">Logo</span>
          </div>
        )
      
      case 'date':
        try {
          const date = new Date(value)
          return (
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              {date.toLocaleDateString()}
            </div>
          )
        } catch {
          return value
        }
      
      case 'status':
        const statusColors = {
          'Open': 'bg-green-100 text-green-800',
          'Closed': 'bg-red-100 text-red-800',
          'Pending': 'bg-yellow-100 text-yellow-800',
          'Active': 'bg-blue-100 text-blue-800',
          'Inactive': 'bg-gray-100 text-gray-800'
        }
        
        const statusIcons = {
          'Open': <CheckCircle className="w-3 h-3 mr-1" />,
          'Closed': <XCircle className="w-3 h-3 mr-1" />,
          'Pending': <Clock className="w-3 h-3 mr-1" />,
          'Active': <CheckCircle className="w-3 h-3 mr-1" />,
          'Inactive': <XCircle className="w-3 h-3 mr-1" />
        }
        
        return (
          <Badge className={statusColors[value as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
            {statusIcons[value as keyof typeof statusIcons]}
            {value}
          </Badge>
        )
      
      case 'number':
        return (
          <span className="font-mono">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
        )
      
      default:
        return value
    }
  }

  if (rows.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search table..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-gray-500">
          {filteredRows.length} {filteredRows.length === 1 ? 'result' : 'results'}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                {columns.map((column, index) => (
                  <TableHead key={index} className="font-medium">
                    {column.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRows.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-gray-50">
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      {renderCellContent(row[column.name], column.type)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRows.length)} of {filteredRows.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber
                if (totalPages <= 5) {
                  pageNumber = i + 1
                } else if (currentPage <= 3) {
                  pageNumber = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i
                } else {
                  pageNumber = currentPage - 2 + i
                }
                
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}