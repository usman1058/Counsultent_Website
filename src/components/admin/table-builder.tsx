'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Plus,
    Trash2,
    Edit,
    Save,
    X,
    GripVertical,
    Image,
    Link,
    Type,
    Hash
} from 'lucide-react'
import { toast } from 'sonner'
import { useTableBuilder } from '@/hooks/useTableBuilder'
import ImageUpload from '@/components/ui/image-upload'
import TablePreview from './table-preview'

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

interface TableBuilderProps {
    detailPages: any[]
    initialData?: any
    onSave: (data: any) => void
    onCancel: () => void
}

export default function TableBuilder({
    detailPages,
    initialData,
    onSave,
    onCancel
}: TableBuilderProps) {
    const [title, setTitle] = useState(initialData?.title || '')
    const [description, setDescription] = useState(initialData?.description || '')
    const [detailPageId, setDetailPageId] = useState(initialData?.detailPageId?.toString() || '')
    const [iconUrl, setIconUrl] = useState(initialData?.iconUrl || '')
    const [isSaving, setIsSaving] = useState(false)
    const [editingColumn, setEditingColumn] = useState<string | null>(null)
    const [newColumnName, setNewColumnName] = useState('')
    const [newColumnType, setNewColumnType] = useState<Column['type']>('text')
    const [showAddColumn, setShowAddColumn] = useState(false)

    const initialColumns = initialData?.columns || []
    const initialRows = initialData?.rows || []

    const {
        columns,
        rows,
        addColumn,
        updateColumn,
        deleteColumn,
        addRow,
        updateRow,
        deleteRow,
        handleDragStart,
        handleDragOver,
        handleDrop
    } = useTableBuilder(initialColumns, initialRows)

    const handleAddColumn = () => {
        if (!newColumnName.trim()) {
            toast.error('Column name is required')
            return
        }

        // Check for duplicate column names
        if (columns.some(col => col.name.toLowerCase() === newColumnName.toLowerCase())) {
            toast.error('Column name already exists')
            return
        }

        addColumn({
            name: newColumnName,
            type: newColumnType
        })

        setNewColumnName('')
        setNewColumnType('text')
        setShowAddColumn(false)
        toast.success('Column added successfully')
    }

    const handleUpdateColumn = (id: string, name: string) => {
        if (!name.trim()) {
            toast.error('Column name is required')
            return
        }

        // Check for duplicate column names (excluding current column)
        if (columns.some(col => col.id !== id && col.name.toLowerCase() === name.toLowerCase())) {
            toast.error('Column name already exists')
            return
        }

        updateColumn(id, { name })
        setEditingColumn(null)
        toast.success('Column updated successfully')
    }

    const handleDeleteColumn = (id: string) => {
        if (!confirm('Are you sure you want to delete this column? All data in this column will be lost.')) {
            return
        }

        deleteColumn(id)
        toast.success('Column deleted successfully')
    }

    const handleAddRow = () => {
        addRow()
        toast.success('Row added successfully')
    }

    const handleDeleteRow = (id: string) => {
        if (!confirm('Are you sure you want to delete this row?')) {
            return
        }

        deleteRow(id)
        toast.success('Row deleted successfully')
    }

    const handleCellChange = (rowId: string, columnId: string, value: any) => {
        updateRow(rowId, { [columnId]: value })
    }

    const handleSave = async () => {
        console.log('Saving table:', { 
            title, 
            description, 
            detailPageId, 
            columns, 
            rows, 
            iconUrl,
            initialData: initialData?.id
        });
        
        if (!title.trim()) {
            toast.error('Table title is required')
            return
        }

        if (!detailPageId) {
            toast.error('Please select a card')
            return
        }

        if (columns.length === 0) {
            toast.error('Please add at least one column')
            return
        }

        setIsSaving(true)

        try {
            // For creating a new table, use the tables POST endpoint
            if (!initialData?.id) {
                const response = await fetch('/api/admin/tables', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        detailPageId: parseInt(detailPageId),
                        columns,
                        rows,
                        iconUrl
                    })
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    console.error('Create failed:', errorData);
                    throw new Error(errorData.error || 'Failed to create table')
                }

                const newTable = await response.json()
                console.log('Created table:', newTable);
                onSave(newTable)
            } else {
                // For updating an existing table, use the tables PUT endpoint
                const response = await fetch(`/api/admin/tables/${initialData.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        detailPageId: parseInt(detailPageId), // This is the key change
                        columns,
                        rows,
                        iconUrl
                    })
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    console.error('Update failed:', errorData);
                    throw new Error(errorData.error || 'Failed to update table')
                }

                const updatedTable = await response.json()
                console.log('Updated table:', updatedTable);
                onSave(updatedTable)
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to save table')
        } finally {
            setIsSaving(false)
        }
    }

    const getColumnTypeIcon = (type: Column['type']) => {
        switch (type) {
            case 'text':
                return <Type className="w-4 h-4" />
            case 'number':
                return <Hash className="w-4 h-4" />
            case 'image':
                return <Image className="w-4 h-4" />
            case 'link':
                return <Link className="w-4 h-4" />
            case 'richtext':
                return <Type className="w-4 h-4" />
            default:
                return <Type className="w-4 h-4" />
        }
    }

    const renderCellInput = (rowId: string, column: Column, value: any) => {
        switch (column.type) {
            case 'text':
            case 'number':
                return (
                    <Input
                        value={value || ''}
                        onChange={(e) => handleCellChange(rowId, column.id, column.type === 'number' ? Number(e.target.value) : e.target.value)}
                        type={column.type === 'number' ? 'number' : 'text'}
                        placeholder={`Enter ${column.name}`}
                    />
                )
            case 'image':
                return (
                    <ImageUpload
                        value={value || ''}
                        onChange={(url) => handleCellChange(rowId, column.id, url)}
                        placeholder="Enter image URL or upload"
                    />
                )
            case 'link':
                return (
                    <Input
                        value={value || ''}
                        onChange={(e) => handleCellChange(rowId, column.id, e.target.value)}
                        placeholder="Enter URL"
                    />
                )
            case 'richtext':
                return (
                    <Textarea
                        value={value || ''}
                        onChange={(e) => handleCellChange(rowId, column.id, e.target.value)}
                        placeholder={`Enter ${column.name}`}
                        rows={3}
                    />
                )
            default:
                return (
                    <Input
                        value={value || ''}
                        onChange={(e) => handleCellChange(rowId, column.id, e.target.value)}
                        placeholder={`Enter ${column.name}`}
                    />
                )
        }
    }

    return (
        <div className="space-y-6">
            <Tabs defaultValue="metadata" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="metadata">Table Settings</TabsTrigger>
                    <TabsTrigger value="columns">Columns</TabsTrigger>
                    <TabsTrigger value="rows">Rows & Data</TabsTrigger>
                </TabsList>

                <TabsContent value="metadata" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="title">Table Title *</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., University Rankings"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="detailPage">Card *</Label>
                            <Select value={detailPageId} onValueChange={setDetailPageId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a card" />
                                </SelectTrigger>
                                <SelectContent>
                                    {detailPages.map((detailPage) => (
                                        <SelectItem key={detailPage.id} value={detailPage.id.toString()}>
                                            {detailPage.cardTitle} - {detailPage.categoryTitle} ({detailPage.studyPageTitle})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of the table"
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label>Table Icon</Label>
                        <ImageUpload
                            value={iconUrl}
                            onChange={(url) => setIconUrl(url || '')}
                            placeholder="Upload a table icon or enter URL"
                        />
                    </div>
                </TabsContent>

                <TabsContent value="columns" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Table Columns</h3>
                        <Button onClick={() => setShowAddColumn(true)} variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Column
                        </Button>
                    </div>

                    {showAddColumn && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Add New Column</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="columnName">Column Name</Label>
                                        <Input
                                            id="columnName"
                                            value={newColumnName}
                                            onChange={(e) => setNewColumnName(e.target.value)}
                                            placeholder="e.g., University"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="columnType">Data Type</Label>
                                        <Select value={newColumnType} onValueChange={(value: Column['type']) => setNewColumnType(value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="text">Text</SelectItem>
                                                <SelectItem value="number">Number</SelectItem>
                                                <SelectItem value="image">Image</SelectItem>
                                                <SelectItem value="link">Link</SelectItem>
                                                <SelectItem value="richtext">Rich Text</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <Button onClick={handleAddColumn}>Add</Button>
                                        <Button variant="outline" onClick={() => setShowAddColumn(false)}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {columns.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-8">
                                <p className="text-gray-500 mb-4">No columns added yet</p>
                                <Button onClick={() => setShowAddColumn(true)} variant="outline">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Your First Column
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-2">
                            {columns.map((column) => (
                                <Card key={column.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 rounded">
                                                    {getColumnTypeIcon(column.type)}
                                                </div>
                                                {editingColumn === column.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            value={column.name}
                                                            onChange={(e) => updateColumn(column.id, { name: e.target.value })}
                                                            className="w-48"
                                                        />
                                                        <Button size="sm" onClick={() => setEditingColumn(null)}>
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="sm" onClick={() => handleUpdateColumn(column.id, column.name)}>
                                                            <Save className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{column.name}</span>
                                                        <Badge variant="outline">{column.type}</Badge>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {editingColumn !== column.id && (
                                                    <Button size="sm" variant="ghost" onClick={() => setEditingColumn(column.id)}>
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                <Button size="sm" variant="ghost" onClick={() => handleDeleteColumn(column.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="rows" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Table Rows</h3>
                        <Button onClick={handleAddRow} disabled={columns.length === 0}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Row
                        </Button>
                    </div>

                    {columns.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-8">
                                <p className="text-gray-500 mb-4">Add columns first before adding rows</p>
                                <Button onClick={() => setShowAddColumn(true)} variant="outline">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Columns
                                </Button>
                            </CardContent>
                        </Card>
                    ) : rows.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-8">
                                <p className="text-gray-500 mb-4">No rows added yet</p>
                                <Button onClick={handleAddRow} variant="outline">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Your First Row
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="p-2 text-left w-10"></th>
                                                {columns.map((column) => (
                                                    <th key={column.id} className="p-2 text-left">
                                                        <div className="flex items-center gap-2">
                                                            {getColumnTypeIcon(column.type)}
                                                            {column.name}
                                                        </div>
                                                    </th>
                                                ))}
                                                <th className="p-2 text-left w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((row, index) => (
                                                <tr
                                                    key={row.id}
                                                    className="border-b hover:bg-gray-50"
                                                    draggable
                                                    onDragStart={() => handleDragStart(row.id)}
                                                    onDragOver={handleDragOver}
                                                    onDrop={(e) => handleDrop(e, row.id)}
                                                >
                                                    <td className="p-2">
                                                        <div className="cursor-move">
                                                            <GripVertical className="w-4 h-4 text-gray-400" />
                                                        </div>
                                                    </td>
                                                    {columns.map((column) => (
                                                        <td key={column.id} className="p-2">
                                                            {renderCellInput(row.id, column, row.data[column.id])}
                                                        </td>
                                                    ))}
                                                    <td className="p-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDeleteRow(row.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

            <Separator />

            <div className="flex justify-between">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" disabled={columns.length === 0 || rows.length === 0}>
                        Preview
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Table'}
                    </Button>
                </div>
            </div>
        </div>
    )
}