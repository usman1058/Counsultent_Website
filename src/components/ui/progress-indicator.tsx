'use client'

import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'

interface ProgressIndicatorProps {
  isLoading: boolean
  text?: string
}

export default function ProgressIndicator({ isLoading, text = 'Loading...' }: ProgressIndicatorProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isLoading) {
      setProgress(0)
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + Math.random() * 10
        })
      }, 200)

      return () => clearInterval(interval)
    } else {
      setProgress(100)
      const timeout = setTimeout(() => setProgress(0), 500)
      return () => clearTimeout(timeout)
    }
  }, [isLoading])

  if (!isLoading && progress === 0) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <Progress value={progress} className="h-2" />
          </div>
          {text && (
            <span className="text-sm text-gray-600 animate-pulse">
              {text}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}