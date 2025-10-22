import { useState, useCallback } from 'react'

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

export function useTableBuilder(initialColumns: Column[] = [], initialRows: Row[] = []) {
  const [columns, setColumns] = useState<Column[]>(initialColumns)
  const [rows, setRows] = useState<Row[]>(initialRows)
  const [draggedRow, setDraggedRow] = useState<string | null>(null)

  const addColumn = useCallback((column: Omit<Column, 'id'>) => {
    const newColumn: Column = {
      ...column,
      id: `col-${Date.now()}`
    }
    
    setColumns(prev => [...prev, newColumn])
    
    // Add empty values for this column to all existing rows
    setRows(prev => prev.map(row => ({
      ...row,
      data: {
        ...row.data,
        [newColumn.id]: getDefaultValueForType(column.type)
      }
    })))
    
    return newColumn.id
  }, [])

  const updateColumn = useCallback((id: string, updates: Partial<Column>) => {
    setColumns(prev => prev.map(col => 
      col.id === id ? { ...col, ...updates } : col
    ))
  }, [])

  const deleteColumn = useCallback((id: string) => {
    setColumns(prev => prev.filter(col => col.id !== id))
    
    // Remove this column from all rows
    setRows(prev => prev.map(row => {
      const newData = { ...row.data }
      delete newData[id]
      return { ...row, data: newData }
    }))
  }, [])

  const addRow = useCallback(() => {
    const newRow: Row = {
      id: `row-${Date.now()}`,
      data: columns.reduce((acc, col) => {
        acc[col.id] = getDefaultValueForType(col.type)
        return acc
      }, {} as Record<string, any>)
    }
    
    setRows(prev => [...prev, newRow])
    return newRow.id
  }, [columns])

  const updateRow = useCallback((id: string, data: Record<string, any>) => {
    setRows(prev => prev.map(row => 
      row.id === id ? { ...row, data: { ...row.data, ...data } } : row
    ))
  }, [])

  const deleteRow = useCallback((id: string) => {
    setRows(prev => prev.filter(row => row.id !== id))
  }, [])

  const moveRow = useCallback((fromIndex: number, toIndex: number) => {
    setRows(prev => {
      const newRows = [...prev]
      const [removed] = newRows.splice(fromIndex, 1)
      newRows.splice(toIndex, 0, removed)
      return newRows
    })
  }, [])

  const handleDragStart = useCallback((rowId: string) => {
    setDraggedRow(rowId)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    
    if (!draggedRow || draggedRow === targetId) return
    
    const draggedIndex = rows.findIndex(row => row.id === draggedRow)
    const targetIndex = rows.findIndex(row => row.id === targetId)
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      moveRow(draggedIndex, targetIndex)
    }
    
    setDraggedRow(null)
  }, [draggedRow, rows, moveRow])

  const resetTable = useCallback(() => {
    setColumns([])
    setRows([])
  }, [])

  const loadTable = useCallback((tableColumns: Column[], tableRows: Row[]) => {
    setColumns(tableColumns)
    setRows(tableRows)
  }, [])

  return {
    columns,
    rows,
    addColumn,
    updateColumn,
    deleteColumn,
    addRow,
    updateRow,
    deleteRow,
    moveRow,
    handleDragStart,
    handleDragOver,
    handleDrop,
    resetTable,
    loadTable
  }
}

function getDefaultValueForType(type: Column['type']) {
  switch (type) {
    case 'text':
    case 'link':
      return ''
    case 'number':
      return 0
    case 'image':
      return ''
    case 'richtext':
      return ''
    default:
      return ''
  }
}