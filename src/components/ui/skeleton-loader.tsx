'use client'

import { Skeleton } from '@/components/ui/skeleton'

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'table' | 'hero'
  count?: number
}

export default function SkeletonLoader({ type = 'card', count = 3 }: SkeletonLoaderProps) {
  const renderCardSkeleton = () => (
    <div className="border rounded-lg p-6 space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )

  const renderListSkeleton = () => (
    <div className="space-y-3">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  )

  const renderTableSkeleton = () => (
    <div className="border rounded-lg overflow-hidden">
      <div className="border-b bg-gray-50 p-4">
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      <div className="divide-y">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4">
            <div className="grid grid-cols-4 gap-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderHeroSkeleton = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-full mx-auto" />
        <Skeleton className="h-6 w-5/6 mx-auto" />
        <div className="flex justify-center space-x-4">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton className="h-8 w-8 mx-auto" />
            <Skeleton className="h-4 w-16 mx-auto" />
            <Skeleton className="h-3 w-20 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )

  const renderSkeleton = () => {
    switch (type) {
      case 'list':
        return renderListSkeleton()
      case 'table':
        return renderTableSkeleton()
      case 'hero':
        return renderHeroSkeleton()
      default:
        return renderCardSkeleton()
    }
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  )
}