/**
 * Skeleton loader for media cards
 * Matches the exact dimensions of MediaCard to prevent layout shift
 */
export default function SkeletonCard() {
  return (
    <div className="w-full aspect-[2/3] rounded-xl shimmer relative overflow-hidden bg-black/[0.05] dark:bg-white/[0.05]">
      {/* Rating badge skeleton */}
      <div className="absolute top-2 left-2 h-4 w-10 rounded-full bg-black/[0.08] dark:bg-white/[0.08]" />

      {/* Bookmark button skeleton */}
      <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/[0.08] dark:bg-white/[0.08]" />

      {/* Title and year skeleton */}
      <div className="absolute bottom-0 left-0 right-0 p-2 space-y-1">
        <div className="h-3 w-1/2 rounded bg-black/[0.08] dark:bg-white/[0.08]" />
        <div className="h-2 w-1/3 rounded bg-black/[0.05] dark:bg-white/[0.05]" />
      </div>
    </div>
  )
}
