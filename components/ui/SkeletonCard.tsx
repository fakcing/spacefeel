export default function SkeletonCard() {
  return (
    <div className="w-full aspect-[2/3] rounded-xl shimmer relative overflow-hidden">
      <div className="absolute bottom-0 left-0 right-0 p-2 space-y-1">
        <div className="h-3 w-1/2 rounded bg-white/10" />
        <div className="h-2 w-1/3 rounded bg-white/10" />
      </div>
    </div>
  )
}
