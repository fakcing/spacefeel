import { Suspense } from 'react'
import Link from 'next/link'
import { cache } from 'react'
import { getTranslations } from 'next-intl/server'
import { fetchTrending, fetchPopular, fetchTopRated, fetchUpcoming, fetchNowPlaying, fetchDiscover, fetchSearchMovies } from '@/lib/tmdb'
import { Movie, TMDBResponse } from '@/types/tmdb'
import MediaCard from '@/components/cards/MediaCard'
import Pagination from '@/components/ui/Pagination'
import MovieFilters from '@/components/movies/MovieFilters'



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

  const t = await getTranslations('pages.movies')
  const tf = await getTranslations('filters')
  const td = await getTranslations('dropdown')

  const categories = [
    { value: 'trending',    label: td('trending') },
    { value: 'popular',     label: td('popular') },
    { value: 'upcoming',    label: td('upcoming') },
    { value: 'now_playing', label: td('nowPlaying') },
    { value: 'top_rated',   label: td('topRated') },
    { value: 'discover',    label: td('discover') },
  ]
  const ANIMATION_GENRE = 16
  const selectedGenreIds = genres ? genres.split(',').filter(Boolean).map(Number) : []
  const animationSelected = selectedGenreIds.includes(ANIMATION_GENRE)

  let results: Movie[]
  let total_pages: number

  if (q) {
    const r = await fetchSearchMovies(q, page)
    results = r.results.filter(m => animationSelected || !m.genre_ids?.includes(ANIMATION_GENRE))
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
    if (year_from) params['primary_release_date.gte'] = `${year_from}-01-01`
    if (year_to)   params['primary_release_date.lte'] = `${year_to}-12-31`
    if (min_vote)  { params['vote_average.gte'] = min_vote; params['vote_count.gte'] = '100' }
    if (language)  params.with_original_language = language

    const r = await fetchDiscover('movie', params) as TMDBResponse<Movie>
    results = r.results
    total_pages = r.total_pages
  } else if (!animationSelected) {
    // Fetch 2 TMDB pages per virtual page so after filtering animation we always have 20 results
    const tmdbPage1 = page * 2 - 1
    const tmdbPage2 = page * 2
    const [r1, r2] = await Promise.all([
      getByCategory(category, tmdbPage1),
      getByCategory(category, tmdbPage2).catch(() => ({ results: [] as Movie[], total_pages: 1 })),
    ])
    const combined = [...r1.results, ...r2.results].filter(m => !m.genre_ids?.includes(ANIMATION_GENRE))
    results = combined.slice(0, 20)
    total_pages = Math.ceil(r1.total_pages / 2)
  } else {
    const r = await getByCategory(category, page)
    results = r.results
    total_pages = r.total_pages
  }

  const label = hasFilters
    ? q ? tf('resultsFor', { q }) : tf('activeFilters')
    : (categories.find((c) => c.value === category)?.label || td('trending'))

  const baseHref = `/movies?category=${category}${q ? `&q=${q}` : ''}${genres ? `&genres=${genres}` : ''}${sort_by ? `&sort_by=${sort_by}` : ''}${year_from ? `&year_from=${year_from}` : ''}${year_to ? `&year_to=${year_to}` : ''}${min_vote ? `&min_vote=${min_vote}` : ''}${language ? `&language=${language}` : ''}`

  return (
    <div className="min-h-screen">
      <div className="relative pt-20 pb-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, var(--color-overlay) 0%, transparent 100%)' }} />
        <div className="relative px-4 md:px-8 max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.05em' }}>
            {hasFilters ? label : t('title')}
          </h1>
          {!hasFilters && (
            <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>{t('description')}</p>
          )}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mt-4 -mx-4 px-4 md:mx-0 md:px-0">
            {categories.map((cat) => {
              const isActive = category === cat.value && !hasFilters
              return (
                <Link
                  key={cat.value}
                  href={`/movies?category=${cat.value}`}
                  className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={{
                    backgroundColor: isActive ? 'var(--color-text)' : 'var(--color-overlay)',
                    color: isActive ? 'var(--color-bg)' : 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {cat.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 max-w-7xl mx-auto pb-24">
        <Suspense>
          <MovieFilters q={q} genres={genres} sort_by={sort_by} year_from={year_from} year_to={year_to} min_vote={min_vote} language={language} />
        </Suspense>

        {results.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{tf('noResults')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {results.map((movie, index) => (
              <MediaCard key={movie.id} item={movie} mediaType="movie" priority={index < 6} />
            ))}
          </div>
        )}

        <Pagination currentPage={page} totalPages={total_pages} baseHref={baseHref} />
      </div>
    </div>
  )
}
