'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Type, 
  Hash, 
  Image as ImageIcon, 
  Link, 
  FileText,
  ChevronDown,
  ChevronUp,
  Info,
  Search
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'

interface Column {
  id: string
  name: string
  type: 'text' | 'number' | 'image' | 'link' | 'richtext' | 'boolean' | 'date'
  icon?: string
  width?: number
}

// Updated Row interface to handle different possible structures
interface Row {
  id: string
  data: any[]  // Array of values
  [key: string]: any  // Allow for dynamic properties
}

interface DynamicTableRendererProps {
  title: string
  description?: string | null
  columns: Column[]
  rows: Row[]
  iconUrl?: string | null
}

export default function DynamicTableRenderer({ 
  title, 
  description, 
  columns, 
  rows, 
  iconUrl 
}: DynamicTableRendererProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'ascending' | 'descending'
  } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredRows, setFilteredRows] = useState<Row[]>(rows)

  // Force re-render when props change
  useEffect(() => {
    // This effect will run when any prop changes, ensuring the component updates
    console.log('DynamicTableRenderer props updated:', { 
      title, 
      columnsCount: columns.length,
      rowsCount: rows.length,
      iconUrl 
    });
    
    // Log the structure of the first row to understand the data format
    if (rows.length > 0) {
      console.log('First row structure:', rows[0]);
      console.log('First row data:', rows[0].data);
      console.log('First row data length:', rows[0].data?.length);
      
      if (rows[0].data && rows[0].data.length > 0) {
        console.log('First data item in first row:', rows[0].data[0]);
        console.log('Columns array:', columns);
      }
    }
  }, [title, description, columns, rows, iconUrl])

  // Filter rows based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRows(rows)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = rows.filter(row => {
      // Check if any cell in the row contains the search term
      return row.data?.some((cell: any) => {
        if (cell === null || cell === undefined) return false
        return cell.toString().toLowerCase().includes(term)
      })
    })

    setFilteredRows(filtered)
  }, [searchTerm, rows])

  const sortedRows = [...filteredRows]
  
  if (sortConfig !== null) {
    sortedRows.sort((a, b) => {
      const columnIndex = columns.findIndex(col => col.id === sortConfig.key)
      if (columnIndex === -1) return 0
      
      // Get the cell value from the data array
      const aValue = a.data && a.data[columnIndex] ? a.data[columnIndex] : ''
      const bValue = b.data && b.data[columnIndex] ? b.data[columnIndex] : ''
      
      // Handle different data types for sorting
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1
      }
      return 0
    })
  }

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null
    }
    return sortConfig.direction === 'ascending' 
      ? <ChevronUp className="h-4 w-4" /> 
      : <ChevronDown className="h-4 w-4" />
  }

  const getColumnTypeIcon = (type: Column['type']) => {
    switch (type) {
      case 'text':
        return <Type className="w-4 h-4" />
      case 'number':
        return <Hash className="w-4 h-4" />
      case 'image':
        return <ImageIcon className="w-4 h-4" />
      case 'link':
        return <Link className="w-4 h-4" />
      case 'richtext':
        return <FileText className="w-4 h-4" />
      case 'boolean':
        return <Type className="w-4 h-4" />
      case 'date':
        return <Type className="w-4 h-4" />
      default:
        return <Type className="w-4 h-4" />
    }
  }

  const renderCellContent = (column: Column, value: any, rowIndex: number, cellIndex: number) => {
    console.log(`Rendering cell for row ${rowIndex}, column ${cellIndex}, value:`, value);
    
    if (value === null || value === undefined || value === '') {
      console.log(`Cell is empty, returning "-"`);
      return '-';
    }

    switch (column.type) {
      case 'text':
        return <span className="text-gray-900">{value}</span>
      case 'number':
        return <span className="font-medium text-gray-900">{value}</span>
      case 'image':
        return (
          <div className="flex items-center">
            {value ? (
              <img 
                src={value} 
                alt={column.name}
                className="w-16 h-16 object-cover rounded-md border"
                onError={(e) => {
                  // Fallback for broken images
                  e.currentTarget.src = 'https://via.placeholder.com/64x64?text=No+Image';
                }}
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                <ImageIcon className="w-6 h-6" />
              </div>
            )}
          </div>
        )
      case 'link':
        return (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
          >
            {value}
            <Link className="w-4 h-4 ml-1" />
          </a>
        )
      case 'richtext':
        return <div 
          className="prose prose-sm max-w-none" 
          dangerouslySetInnerHTML={{ __html: value }} 
        />
      case 'boolean':
        return value ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Yes
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            No
          </span>
        )
      case 'date':
        return <span className="text-gray-900">{new Date(value).toLocaleDateString()}</span>
      default:
        return <span className="text-gray-900">{value}</span>
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full"
    >
      <Card className="shadow-lg overflow-hidden border border-gray-200">
        {(title || description) && (
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-4">
            <div className="flex items-start gap-3">
              {iconUrl && (
                <div className="flex-shrink-0">
                  <Image 
                    src={iconUrl} 
                    alt={title || 'Table icon'}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-lg object-cover"
                    onError={(e) => {
                      // Fallback for broken images
                      e.currentTarget.src = 'https://via.placeholder.com/40x40?text=Icon';
                    }}
                  />
                </div>
              )}
              <div className="flex-1">
                <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
                {description && (
                  <CardDescription className="text-gray-600 mt-1">{description}</CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
        )}
        <CardContent className="p-0">
          {/* Search Bar */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search table..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              {searchTerm && (
                <span className="text-sm text-gray-500">
                  {filteredRows.length} of {rows.length} results
                </span>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600">
                  {columns.map((column) => (
                    <TableHead 
                      key={column.id} 
                      className="text-white font-medium"
                      style={{ width: column.width ? `${column.width}%` : undefined }}
                    >
                      <div className="flex items-center gap-2">
                        {getColumnTypeIcon(column.type)}
                        <span>{column.name}</span>
                        {(column.type === 'text' || column.type === 'number' || column.type === 'date' || column.type === 'boolean') && (
                          <button 
                            onClick={() => requestSort(column.id)}
                            className="ml-1 focus:outline-none"
                          >
                            {getSortIcon(column.id)}
                          </button>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRows.map((row, rowIndex) => (
                  <motion.tr 
                    key={`${row.id}-${rowIndex}`}
                    variants={itemVariants}
                    className={rowIndex % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"}
                  >
                    {columns.map((column, cellIndex) => (
                      <TableCell 
                        key={`${column.id}-${cellIndex}`} 
                        className="py-3 px-4"
                      >
                        {row.data && row.data[cellIndex] !== undefined 
                          ? renderCellContent(column, row.data[cellIndex], rowIndex, cellIndex)
                          : (
                            <span className="text-gray-400">No data</span>
                          )
                        }
                      </TableCell>
                    ))}
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredRows.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-gray-50">
              <Info className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-lg font-medium">No matching results</p>
              <p className="text-sm mt-1">Try adjusting your search terms</p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
          
          {rows.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-gray-50">
              <Info className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-lg font-medium">No data to display</p>
              <p className="text-sm mt-1">There are no records available for this table.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}