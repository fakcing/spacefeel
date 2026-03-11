import { cache } from 'react'
import { fetchYaniCatalog } from '@/lib/yani'
import AniCard from '@/components/cards/AniCard'
import Pagination from '@/components/ui/Pagination'

const getAnimeCatalog = cache(async (page: number) => {
  return await fetchYaniCatalog(page)
})

export default async function AnimePage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const page = Math.max(1, parseInt(searchParams.page || '1') || 1)
  const { items, hasMore } = await getAnimeCatalog(page)
  const totalPages = hasMore ? page + 10 : page
  const baseHref = `/anime`

  return (
    <div className="min-h-screen pt-20 px-6 md:px-10 lg:px-16 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-8 text-[var(--text-primary)]">Аниме</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <AniCard key={item.anime_id} item={item} />
        ))}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} baseHref={baseHref} />
    </div>
  )
}
