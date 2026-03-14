import Link from 'next/link'
import { cache } from 'react'
import { fetchDiscover, fetchOnTheAir, fetchAiringToday } from '@/lib/tmdb'
import { TVShow, TMDBResponse } from '@/types/tmdb'
import MediaCard from '@/components/cards/MediaCard'
import Pagination from '@/components/ui/Pagination'


const categories = [
  { value: 'trending',     label: 'Trending' },
  { value: 'popular',      label: 'Popular' },
  { value: 'top_rated',    label: 'Top Rated' },
  { value: 'on_the_air',   label: 'On The Air' },
  { value: 'airing_today', label: 'Airing Today' },
  { value: 'discover',     label: 'Discover' },
]

// Exclude animation (genre 16) from all TV discover fetches
const noAnim = { without_genres: '16' }

const getShows = cache(async (category: string, page: number): Promise<{ results: TVShow[]; total_pages: number }> => {
  let r: TMDBResponse<TVShow>
  const p = String(page)
  switch (category) {
    case 'trending':
      r = await fetchDiscover('tv', { ...noAnim, sort_by: 'popularity.desc', page: p }) as TMDBResponse<TVShow>
      break
    case 'popular':
      r = await fetchDiscover('tv', { ...noAnim, sort_by: 'popularity.desc', page: p }) as TMDBResponse<TVShow>
      break
    case 'top_rated':
      r = await fetchDiscover('tv', { ...noAnim, sort_by: 'vote_average.desc', 'vote_count.gte': '200', page: p }) as TMDBResponse<TVShow>
      break
    case 'on_the_air':
      r = await fetchOnTheAir(page)
      break
    case 'airing_today':
      r = await fetchAiringToday(page)
      break
    case 'discover':
      r = await fetchDiscover('tv', { ...noAnim, sort_by: 'popularity.desc', page: p }) as TMDBResponse<TVShow>
      break
    default:
      r = await fetchDiscover('tv', { ...noAnim, sort_by: 'popularity.desc', page: p }) as TMDBResponse<TVShow>
  }
  return { results: r.results, total_pages: r.total_pages }
})

export default async function TVPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string }
}) {
  const category = searchParams.category || 'trending'
  const page = Math.max(1, parseInt(searchParams.page || '1') || 1)
  const { results, total_pages } = await getShows(category, page)
  const label = categories.find((c) => c.value === category)?.label || 'Trending'
  const baseHref = `/tv?category=${category}`

  return (
    <div className="min-h-screen pt-20 px-6 md:px-10 lg:px-16 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6 text-[var(--text-primary)]">{label} TV Shows</h1>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8 pb-2">
        {categories.map((cat) => (
          <Link
            key={cat.value}
            href={`/tv?category=${cat.value}`}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-colors ${
              category === cat.value
                ? 'bg-gray-900 dark:bg-white text-white dark:text-black font-semibold'
                : 'bg-black/[0.08] dark:bg-white/[0.08] hover:bg-black/[0.15] dark:hover:bg-white/[0.15] text-[var(--text-muted)]'
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {results.map((show, index) => (
          <MediaCard key={show.id} item={show} mediaType="tv" priority={index < 6} />
        ))}
      </div>

      <Pagination currentPage={page} totalPages={total_pages} baseHref={baseHref} />
    </div>
  )
}
