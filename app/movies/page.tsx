import Link from 'next/link'
import { fetchTrending, fetchPopular, fetchTopRated, fetchUpcoming, fetchNowPlaying, fetchDiscover } from '@/lib/tmdb'
import { Movie, TMDBResponse } from '@/types/tmdb'
import MediaCard from '@/components/cards/MediaCard'
import Pagination from '@/components/ui/Pagination'

export const dynamic = 'force-dynamic'

const categories = [
  { value: 'trending',   label: 'Trending' },
  { value: 'popular',    label: 'Popular' },
  { value: 'upcoming',   label: 'Upcoming' },
  { value: 'now_playing',label: 'Now Playing' },
  { value: 'top_rated',  label: 'Top Rated' },
  { value: 'discover',   label: 'Discover' },
]

async function getMovies(category: string, page: number): Promise<{ results: Movie[]; total_pages: number }> {
  let r: TMDBResponse<Movie>
  switch (category) {
    case 'trending':
      r = await fetchTrending('movie', page) as TMDBResponse<Movie>
      break
    case 'popular':
      r = await fetchPopular('movie', page) as TMDBResponse<Movie>
      break
    case 'upcoming':
      r = await fetchUpcoming(page)
      break
    case 'now_playing':
      r = await fetchNowPlaying(page)
      break
    case 'top_rated':
      r = await fetchTopRated('movie', page) as TMDBResponse<Movie>
      break
    case 'discover':
      r = await fetchDiscover('movie', { sort_by: 'popularity.desc', without_genres: '16', page: String(page) }) as TMDBResponse<Movie>
      break
    default:
      r = await fetchTrending('movie', page) as TMDBResponse<Movie>
  }
  return { results: r.results, total_pages: r.total_pages }
}

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string }
}) {
  const category = searchParams.category || 'trending'
  const page = Math.max(1, parseInt(searchParams.page || '1') || 1)
  const { results, total_pages } = await getMovies(category, page)
  const label = categories.find((c) => c.value === category)?.label || 'Trending'
  const baseHref = `/movies?category=${category}`

  return (
    <div className="min-h-screen pt-20 px-6 md:px-10 lg:px-16 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6 text-[var(--text-primary)]">{label} Movies</h1>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8 pb-2">
        {categories.map((cat) => (
          <Link
            key={cat.value}
            href={`/movies?category=${cat.value}`}
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
        {results.map((movie) => (
          <MediaCard key={movie.id} item={movie} mediaType="movie" />
        ))}
      </div>

      <Pagination currentPage={page} totalPages={total_pages} baseHref={baseHref} />
    </div>
  )
}
