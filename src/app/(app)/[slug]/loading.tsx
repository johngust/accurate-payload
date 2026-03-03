import React from 'react'

export default function Loading() {
  return (
    <div className="w-full animate-pulse">
      {/* Hero Skeleton */}
      <div className="w-full h-[60vh] bg-muted/40 relative overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center gap-6">
          <div className="w-3/4 max-w-2xl h-12 bg-muted/60 rounded-md"></div>
          <div className="w-1/2 max-w-lg h-6 bg-muted/60 rounded-md"></div>
          <div className="w-32 h-12 bg-primary/20 rounded-md mt-4"></div>
        </div>
      </div>

      {/* Content Blocks Skeleton */}
      <div className="container py-16 space-y-24">
        {/* Mocking a text block */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="w-full h-4 bg-muted/40 rounded"></div>
          <div className="w-5/6 h-4 bg-muted/40 rounded"></div>
          <div className="w-4/6 h-4 bg-muted/40 rounded"></div>
        </div>

        {/* Mocking a grid block (like products or features) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="w-full aspect-square bg-muted/40 rounded-lg"></div>
              <div className="w-3/4 h-6 bg-muted/40 rounded"></div>
              <div className="w-1/2 h-4 bg-muted/40 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
