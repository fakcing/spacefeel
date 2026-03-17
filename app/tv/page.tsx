import Link from 'next/link'
import { cache } from 'react'
import { fetchDiscover, fetchOnTheAir, fetchAiringToday, fetchSearchTV } from '@/lib/tmdb'
import { TVShow, TMDBResponse } from '@/types/tmdb'
import MediaCard from '@/components/cards/MediaCard'
import Pagination from '@/components/ui/Pagination'
import TVFilters from '@/components/tv/TVFilters'


const categories = [
  { value: 'trending',     label: 'Trending' },
  { value: 'popular',      label: 'Popular' },
  { value: 'top_rated',    label: 'Top Rated' },
  { value: 'on_the_air',   label: 'On The Air' },
  { value: 'airing_today', label: 'Airing Today' },
  { value: 'discover',     label: 'Discover' },
]

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
  const category  = searchParams.category  || 'trending'
  const page      = Math.max(1, parseInt(searchParams.page || '1') || 1)

  const q         = searchParams.q         || ''
  const genres    = searchParams.genres    || ''
  const sort_by   = searchParams.sort_by   || ''
  const year_from = searchParams.year_from || ''
  const year_to   = searchParams.year_to   || ''
  const min_vote  = searchParams.min_vote  || ''
  const language  = searchParams.language  || ''

  const hasFilters = !!(q || genres || sort_by || year_from || year_to || min_vote || language)

  const ANIMATION_GENRE = 16
  const selectedGenreIds = genres ? genres.split(',').filter(Boolean).map(Number) : []
  const animationSelected = selectedGenreIds.includes(ANIMATION_GENRE)

  let results: TVShow[]
  let total_pages: number

  if (q) {
    const r = await fetchSearchTV(q, page)
    results = r.results
    total_pages = r.total_pages
  } else if (hasFilters || category === 'discover') {
    const params: Record<string, string> = {
      sort_by: sort_by || 'popularity.desc',
      page: String(page),
    }
    if (genres) {
      params.with_genres = genres
    }
    if (!animationSelected) {
      params.without_genres = '16'
    }
    if (year_from) params['first_air_date.gte'] = `${year_from}-01-01`
    if (year_to)   params['first_air_date.lte'] = `${year_to}-12-31`
    if (min_vote)  { params['vote_average.gte'] = min_vote; params['vote_count.gte'] = '100' }
    if (language)  params.with_original_language = language

    const r = await fetchDiscover('tv', params) as TMDBResponse<TVShow>
    results = r.results
    total_pages = r.total_pages
  } else {
    const r = await getShows(category, page)
    results = r.results
    total_pages = r.total_pages
  }

  if (!animationSelected) {
    results = results.filter(s => !s.genre_ids?.includes(ANIMATION_GENRE))
  }

  const label = hasFilters
    ? q ? `Результаты: "${q}"` : 'Фильтры'
    : (categories.find(c => c.value === category)?.label || 'Trending') + ' TV Shows'

  const baseHref = `/tv?category=${category}${q ? `&q=${q}` : ''}${genres ? `&genres=${genres}` : ''}${sort_by ? `&sort_by=${sort_by}` : ''}${year_from ? `&year_from=${year_from}` : ''}${year_to ? `&year_to=${year_to}` : ''}${min_vote ? `&min_vote=${min_vote}` : ''}${language ? `&language=${language}` : ''}`

  return (
    <div className="min-h-screen pt-14 pb-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 md:mb-6 text-[var(--text-primary)]">
        {label}
      </h1>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {categories.map((cat) => (
          <Link
            key={cat.value}
            href={`/tv?category=${cat.value}`}
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

      <TVFilters
        q={q}
        genres={genres}
        sort_by={sort_by}
        year_from={year_from}
        year_to={year_to}
        min_vote={min_vote}
        language={language}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {results.map((show, index) => (
          <MediaCard key={show.id} item={show} mediaType="tv" priority={index < 6} />
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
