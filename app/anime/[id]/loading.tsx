export default function Loading() {
  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex gap-8 flex-wrap sm:flex-nowrap">
          <div className="w-44 h-64 flex-shrink-0 rounded-2xl shimmer" />
          <div className="flex-1 space-y-3 pt-2">
            <div className="h-9 w-2/3 rounded shimmer" />
            <div className="h-5 w-1/3 rounded shimmer" />
            <div className="flex gap-2 mt-4">
              <div className="h-6 w-16 rounded-full shimmer" />
              <div className="h-6 w-20 rounded-full shimmer" />
              <div className="h-6 w-14 rounded-full shimmer" />
            </div>
            <div className="flex gap-4 mt-2">
              <div className="h-4 w-12 rounded shimmer" />
              <div className="h-4 w-20 rounded shimmer" />
              <div className="h-4 w-16 rounded shimmer" />
            </div>
            <div className="space-y-2 mt-4">
              <div className="h-4 w-full rounded shimmer" />
              <div className="h-4 w-5/6 rounded shimmer" />
              <div className="h-4 w-4/6 rounded shimmer" />
            </div>
            <div className="h-10 w-32 rounded-full shimmer mt-4" />
          </div>
        </div>
        <div className="mt-12">
          <div className="h-6 w-32 rounded shimmer mb-4" />
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl shimmer" />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
