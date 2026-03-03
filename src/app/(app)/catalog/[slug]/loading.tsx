import React from 'react'

export default function Loading() {
  return (
    <div className="container py-8 animate-pulse">
      {/* Breadcrumbs Skeleton */}
      <div className="w-64 h-4 bg-muted/40 rounded mb-6"></div>
      
      {/* Title Skeleton */}
      <div className="w-1/3 h-10 bg-muted/40 rounded mb-6"></div>

      {/* Subcategories Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 bg-muted/20 rounded-lg"></div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Skeleton */}
        <aside className="w-full shrink-0 md:w-1/4 space-y-6">
          <div className="h-8 bg-muted/40 rounded w-1/2"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-muted/20 rounded w-full"></div>
            ))}
          </div>
        </aside>

        {/* Product Grid Skeleton */}
        <main className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="w-full aspect-square bg-muted/20 rounded-lg"></div>
                <div className="w-3/4 h-5 bg-muted/40 rounded"></div>
                <div className="w-1/3 h-6 bg-muted/40 rounded"></div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
