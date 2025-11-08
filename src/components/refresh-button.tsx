'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface RefreshButtonProps {
  path: string
}

export default function RefreshButton({ path }: RefreshButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      // Call the revalidation API
      const response = await fetch('/api/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path }),
      })

      if (response.ok) {
        // Force a hard refresh of the page
        router.refresh()
      } else {
        console.error('Failed to revalidate page')
        // Fallback to regular refresh
        router.refresh()
      }
    } catch (error) {
      console.error('Error refreshing page:', error)
      // Fallback to regular refresh
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleRefresh}
      disabled={isLoading}
      className="border-gray-300 text-gray-700 hover:bg-gray-50"
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Refreshing...' : 'Refresh Data'}
    </Button>
  )
}