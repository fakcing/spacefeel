import Link from 'next/link'
import { cache } from 'react'
import { fetchTrending, fetchPopular, fetchTopRated, fetchUpcoming, fetchNowPlaying, fetchDiscover, fetchSearchMovies } from '@/lib/tmdb'
import { Movie, TMDBResponse } from '@/types/tmdb'
import MediaCard from '@/components/cards/MediaCard'
import Pagination from '@/components/ui/Pagination'
import MovieFilters from '@/components/movies/MovieFilters'


const categories = [
  { value: 'trending',    label: 'Trending' },
  { value: 'popular',     label: 'Popular' },
  { value: 'upcoming',    label: 'Upcoming' },
  { value: 'now_playing', label: 'Now Playing' },
  { value: 'top_rated',   label: 'Top Rated' },
  { value: 'discover',    label: 'Discover' },
]

const getByCategory = cache(async (category: string, page: number): Promise<{ results: Movie[]; total_pages: number }> => {
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
})

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: {
    category?: string
    page?: string
    q?: string
    genres?: string
    sort_by?: string
    year_from?: string
    year_to?: string
    min_vote?: string
    language?: string
  }
}) {
  const category = searchParams.category || 'trending'
  const page = Math.max(1, parseInt(searchParams.page || '1') || 1)

  const q         = searchParams.q         || ''
  const genres    = searchParams.genres    || ''
  const sort_by   = searchParams.sort_by   || ''
  const year_from = searchParams.year_from || ''
  const year_to   = searchParams.year_to   || ''
  const min_vote  = searchParams.min_vote  || ''
  const language  = searchParams.language  || ''

  const hasFilters = !!(q || genres || sort_by || year_from || year_to || min_vote || language)

  let results: Movie[]
  let total_pages: number

  if (q) {
    const r = await fetchSearchMovies(q, page)
    results = r.results
    total_pages = r.total_pages
  } else if (hasFilters || category === 'discover') {
    const params: Record<string, string> = {
      sort_by: sort_by || 'popularity.desc',
      page: String(page),
    }
    if (genres) {
      params.with_genres = genres
    } else {
      params.without_genres = '16'
    }
    if (year_from) params['primary_release_date.gte'] = `${year_from}-01-01`
    if (year_to)   params['primary_release_date.lte'] = `${year_to}-12-31`
    if (min_vote)  { params['vote_average.gte'] = min_vote; params['vote_count.gte'] = '100' }
    if (language)  params.with_original_language = language

    const r = await fetchDiscover('movie', params) as TMDBResponse<Movie>
    results = r.results
    total_pages = r.total_pages
  } else {
    const r = await getByCategory(category, page)
    results = r.results
    total_pages = r.total_pages
  }

  const label = hasFilters
    ? q ? `Результаты: "${q}"` : 'Фильтры'
    : (categories.find((c) => c.value === category)?.label || 'Trending') + ' Movies'

  const baseHref = `/movies?category=${category}${q ? `&q=${q}` : ''}${genres ? `&genres=${genres}` : ''}${sort_by ? `&sort_by=${sort_by}` : ''}${year_from ? `&year_from=${year_from}` : ''}${year_to ? `&year_to=${year_to}` : ''}${min_vote ? `&min_vote=${min_vote}` : ''}${language ? `&language=${language}` : ''}`

  return (
    <div className="min-h-screen pt-14 pb-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 md:mb-6 text-[var(--text-primary)]">
        {label}
      </h1>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {categories.map((cat) => (
          <Link
            key={cat.value}
            href={`/movies?category=${cat.value}`}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-colors ${
              category === cat.value && !hasFilters
                ? 'bg-gray-900 dark:bg-white text-white dark:text-black font-semibold'
                : 'bg-black/[0.08] dark:bg-white/[0.08] hover:bg-black/[0.15] dark:hover:bg-white/[0.15] text-[var(--text-muted)]'
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      <MovieFilters
        q={q}
        genres={genres}
        sort_by={sort_by}
        year_from={year_from}
        year_to={year_to}
        min_vote={min_vote}
        language={language}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 md:gap-4">
        {results.map((movie, index) => (
          <MediaCard key={movie.id} item={movie} mediaType="movie" priority={index < 6} />
        ))}
      </div>

      {results.length === 0 && (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          Ничего не найдено. Попробуйте изменить фильтры.
        </div>
      )}

      <Pagination currentPage={page} totalPages={total_pages} baseHref={baseHref} />
    </div>
  )
}
