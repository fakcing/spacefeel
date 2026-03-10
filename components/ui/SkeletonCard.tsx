export default function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2">
      <div className="aspect-[2/3] rounded-xl shimmer" />
      <div className="h-3 w-3/4 rounded shimmer" />
      <div className="h-2 w-1/2 rounded shimmer" />
    </div>
  )
}
