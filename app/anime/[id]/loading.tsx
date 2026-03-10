export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="relative w-full h-[56vw] max-h-[600px] shimmer" />
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-32 relative z-10 pb-16">
        <div className="flex gap-8">
          <div className="hidden md:block w-52 flex-shrink-0 aspect-[2/3] rounded-2xl shimmer" />
          <div className="flex-1 pt-4 space-y-4">
            <div className="h-10 w-2/3 rounded shimmer" />
            <div className="h-4 w-1/3 rounded shimmer" />
            <div className="h-4 w-1/4 rounded shimmer" />
            <div className="h-24 w-full rounded shimmer mt-4" />
          </div>
        </div>
      </div>
    </div>
  )
}
