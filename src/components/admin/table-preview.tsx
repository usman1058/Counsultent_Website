'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Type, 
  Hash, 
  Image as ImageIcon, 
  Link, 
  FileText 
} from 'lucide-react'

interface Column {
  id: string
  name: string
  type: 'text' | 'number' | 'image' | 'link' | 'richtext'
  icon?: string
}

interface Row {
  id: string
  data: Record<string, any>
}

interface TablePreviewProps {
  title: string
  description?: string
  columns: Column[]
  rows: Row[]
  iconUrl?: string
}

export default function TablePreview({ 
  title, 
  description, 
  columns, 
  rows, 
  iconUrl 
}: TablePreviewProps) {
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
      default:
        return <Type className="w-4 h-4" />
    }
  }

  const renderCellContent = (column: Column, value: any) => {
    if (!value) return '-'

    switch (column.type) {
      case 'text':
      case 'number':
        return <span>{value}</span>
      case 'image':
        return (
          <div className="flex items-center">
            {value ? (
              <img 
                src={value} 
                alt={column.name}
                className="w-12 h-12 object-cover rounded"
              />
            ) : (
              <span>No image</span>
            )}
          </div>
        )
      case 'link':
        return (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {value}
          </a>
        )
      case 'richtext':
        return <div dangerouslySetInnerHTML={{ __html: value }} />
      default:
        return <span>{value}</span>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {iconUrl && (
              <img 
                src={iconUrl} 
                alt={title}
                className="w-10 h-10 rounded"
              />
            )}
            <div>
              <CardTitle>{title}</CardTitle>
              {description && (
                <CardDescription>{description}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.id}>
                      <div className="flex items-center gap-2">
                        {getColumnTypeIcon(column.type)}
                        {column.name}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {columns.map((column) => (
                      <TableCell key={column.id}>
                        {renderCellContent(column, row.data[column.id])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {rows.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No data to display
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}