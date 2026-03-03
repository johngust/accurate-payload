import React from 'react'

export default function Loading() {
  return (
    <div className="container pt-8 pb-8 animate-pulse">
      {/* Back button skeleton */}
      <div className="w-32 h-10 bg-muted/40 rounded-md mb-4"></div>
      
      <div className="flex flex-col gap-12 rounded-lg border p-8 md:py-12 lg:flex-row lg:gap-8 bg-primary-foreground">
        {/* Image Gallery Skeleton */}
        <div className="h-full w-full basis-full lg:basis-1/2">
          <div className="relative aspect-square h-full max-h-[550px] w-full bg-muted/20 rounded-lg"></div>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-20 bg-muted/20 rounded-md"></div>
            ))}
          </div>
        </div>

        {/* Product Details Skeleton */}
        <div className="basis-full lg:basis-1/2 bg-white p-8 rounded-lg border border-gray-100 shadow-sm space-y-6">
          <div className="w-full h-10 bg-muted/40 rounded-md"></div>
          <div className="w-1/3 h-8 bg-primary/20 rounded-md"></div>
          
          <div className="space-y-3 pt-6">
            <div className="w-full h-4 bg-muted/20 rounded"></div>
            <div className="w-5/6 h-4 bg-muted/20 rounded"></div>
            <div className="w-4/6 h-4 bg-muted/20 rounded"></div>
          </div>
          
          <div className="pt-8">
            <div className="w-full h-12 bg-primary/40 rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
