import Link from 'next/link'
import { fetchAniCatalog } from '@/lib/anilibria'
import AniCard from '@/components/cards/AniCard'
import Pagination from '@/components/ui/Pagination'

const categories = [
  { value: 'updated', label: 'Новинки' },
  { value: 'popular', label: 'Популярное' },
]

export default async function AnimePage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string }
}) {
  const category = searchParams.category || 'updated'
  const page = Math.max(1, parseInt(searchParams.page || '1') || 1)
  const { items, totalPages } = await fetchAniCatalog(category, page)
  const baseHref = `/anime?category=${category}`

  return (
    <div className="min-h-screen pt-20 px-6 md:px-10 lg:px-16 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6 text-[var(--text-primary)]">Аниме</h1>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8 pb-2">
        {categories.map((cat) => (
          <Link
            key={cat.value}
            href={`/anime?category=${cat.value}`}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-colors ${
              category === cat.value
                ? 'bg-white text-black font-semibold'
                : 'bg-white/[0.08] hover:bg-white/[0.15] text-[var(--text-muted)]'
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <AniCard key={item.id} item={item} />
        ))}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} baseHref={baseHref} />
    </div>
  )
}
