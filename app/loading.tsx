import SkeletonCard from '@/components/ui/SkeletonCard'

/**
 * Global loading skeleton for all pages
 * Shows immediately while page data is being fetched
 */
export default function Loading() {
  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Page title skeleton */}
      <div className="h-8 w-48 rounded shimmer mb-8 bg-black/[0.08] dark:bg-white/[0.08]" />
      
      {/* Grid of skeleton cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 18 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}
