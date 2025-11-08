import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface DynamicTable {
  id: number
  title: string
  description?: string
  detailPageId: number
  columns: any[]
  rows: any[]
  iconUrl?: string
  createdAt: string
  updatedAt: string
  detailPage: {
    id: number
    card: {
      id: number
      title: string
      category: {
        title: string
        studyPage: {
          title: string
          slug: string
        }
      }
    }
  }
}

interface UseDynamicTableOptions {
  detailPageId?: number
  autoFetch?: boolean
}

export function useDynamicTable(options: UseDynamicTableOptions = {}) {
  const [tables, setTables] = useState<DynamicTable[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  const fetchTables = async (page = 1, search = '') => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(options.detailPageId && { detailPageId: options.detailPageId.toString() })
      })

      const response = await fetch(`/api/admin/tables?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch tables')
      }

      const data = await response.json()
      setTables(data.tables || [])
      setPagination({
        page: data.pagination?.page || 1,
        limit: data.pagination?.limit || 10,
        total: data.pagination?.total || 0,
        pages: data.pagination?.pages || 0
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      toast.error('Failed to fetch tables')
      // Set default pagination values on error
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const createTable = async (tableData: Omit<DynamicTable, 'id' | 'createdAt' | 'updatedAt' | 'detailPage'>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tableData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create table')
      }

      const newTable = await response.json()
      setTables(prev => [newTable, ...prev])
      toast.success('Table created successfully')
      return newTable
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      toast.error(err instanceof Error ? err.message : 'Failed to create table')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateTable = async (id: number, tableData: Partial<DynamicTable>) => {
    setLoading(true)
    setError(null)

    try {
      console.log('Updating table:', id, tableData);
      
      const response = await fetch(`/api/admin/tables/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tableData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Update failed:', errorData);
        throw new Error(errorData.error || 'Failed to update table')
      }

      const updatedTable = await response.json()
      console.log('Updated table response:', updatedTable);
      
      // Ensure the response includes the detailPage relationship
      if (!updatedTable.detailPage) {
        console.log('Response missing detailPage, fetching full table...');
        // If the response doesn't include the detailPage, fetch the full table data
        const fullTableResponse = await fetch(`/api/admin/tables/${id}`)
        if (fullTableResponse.ok) {
          const fullTable = await fullTableResponse.json()
          console.log('Full table data:', fullTable);
          setTables(prev => prev.map(table => 
            table.id === id ? fullTable : table
          ))
        } else {
          // Fallback: update with what we have
          setTables(prev => prev.map(table => 
            table.id === id ? { ...table, ...updatedTable } : table
          ))
        }
      } else {
        setTables(prev => prev.map(table => 
          table.id === id ? updatedTable : table
        ))
      }
      
      toast.success('Table updated successfully')
      return updatedTable
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      toast.error(err instanceof Error ? err.message : 'Failed to update table')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteTable = async (id: number) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/tables/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete table')
      }

      setTables(prev => prev.filter(table => table.id !== id))
      toast.success('Table deleted successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      toast.error(err instanceof Error ? err.message : 'Failed to delete table')
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchTables()
    }
  }, [options.detailPageId])

  return {
    tables,
    loading,
    error,
    pagination,
    fetchTables,
    createTable,
    updateTable,
    deleteTable
  }
}