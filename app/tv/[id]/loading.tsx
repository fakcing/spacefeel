export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="w-full h-[65vh] shimmer" />
      <div className="max-w-7xl mx-auto px-4 md:px-12 -mt-24 relative z-10">
        <div className="flex gap-8 items-end pb-8">
          <div className="hidden sm:block flex-shrink-0 w-40 aspect-[2/3] rounded-2xl shimmer" />
          <div className="flex-1 pb-2 space-y-3">
            <div className="h-9 w-2/3 rounded shimmer" />
            <div className="h-4 w-1/3 rounded shimmer" />
            <div className="flex gap-2">
              <div className="h-6 w-16 rounded-full shimmer" />
              <div className="h-6 w-20 rounded-full shimmer" />
              <div className="h-6 w-14 rounded-full shimmer" />
            </div>
            <div className="flex gap-3 pt-1">
              <div className="h-10 w-28 rounded-full shimmer" />
              <div className="h-10 w-36 rounded-full shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
