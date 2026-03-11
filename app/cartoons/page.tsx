import Link from 'next/link'
import { cache } from 'react'
import { fetchCartoons } from '@/lib/tmdb'
import { TVShow } from '@/types/tmdb'
import MediaCard from '@/components/cards/MediaCard'
import Pagination from '@/components/ui/Pagination'


const categories = [
  { value: 'trending',  label: 'Trending' },
  { value: 'popular',   label: 'Popular' },
  { value: 'top_rated', label: 'Top Rated' },
  { value: 'family',    label: 'Family Picks' },
  { value: 'new',       label: 'New Releases' },
  { value: 'classics',  label: 'Classics' },
]

const getCartoons = cache(async (category: string, page: number) => {
  return await fetchCartoons(category, page)
})

export default async function CartoonsPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string }
}) {
  const category = searchParams.category || 'popular'
  const page = Math.max(1, parseInt(searchParams.page || '1') || 1)
  const { results, total_pages } = await getCartoons(category, page)
  const label = categories.find((c) => c.value === category)?.label || 'Popular'
  const baseHref = `/cartoons?category=${category}`

  return (
    <div className="min-h-screen pt-20 px-6 md:px-10 lg:px-16 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6 text-[var(--text-primary)]">{label} Cartoons</h1>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8 pb-2">
        {categories.map((cat) => (
          <Link
            key={cat.value}
            href={`/cartoons?category=${cat.value}`}
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
        {(results as TVShow[]).map((item, index) => (
          <MediaCard key={item.id} item={item} mediaType="tv" priority={index < 6} />
        ))}
      </div>

      <Pagination currentPage={page} totalPages={total_pages} baseHref={baseHref} />
    </div>
  )
}
