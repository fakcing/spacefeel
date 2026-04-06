import { Suspense } from 'react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { fetchDiscover } from '@/lib/tmdb'
import { TVShow, TMDBResponse } from '@/types/tmdb'
import MediaCard from '@/components/cards/MediaCard'
import Pagination from '@/components/ui/Pagination'
import CartoonFilters from '@/components/cartoons/CartoonFilters'

function buildCartoonParams(category: string, page: number, overrides: Record<string, string> = {}): Record<string, string> {
  const base: Record<string, string> = {
    with_genres: '16',
    page: String(page),
    ...overrides,
  }
  if (!overrides.sort_by) {
    switch (category) {
      case 'top_rated':
        base.sort_by = 'vote_average.desc'
        base['vote_count.gte'] = '100'
        break
      case 'new':
        base.sort_by = 'first_air_date.desc'
        break
      case 'classics':
        base.sort_by = 'vote_average.desc'
        base['first_air_date.lte'] = '2000-01-01'
        break
      default:
        base.sort_by = 'popularity.desc'
    }
  }
  return base
}

export default async function CartoonsPage({
  searchParams,
}: {
  searchParams: {
    category?: string
    page?: string
    sort_by?: string
    year_from?: string
    year_to?: string
    min_vote?: string
    language?: string
  }
}) {
  const category  = searchParams.category  || 'popular'
  const page      = Math.max(1, parseInt(searchParams.page || '1') || 1)

  const sort_by   = searchParams.sort_by   || ''
  const year_from = searchParams.year_from || ''
  const year_to   = searchParams.year_to   || ''
  const min_vote  = searchParams.min_vote  || ''
  const language  = searchParams.language  || ''

  const hasFilters = !!(sort_by || year_from || year_to || min_vote || language)

  const overrides: Record<string, string> = {}
  if (sort_by)   overrides.sort_by = sort_by
  if (year_from) overrides['first_air_date.gte'] = `${year_from}-01-01`
  if (year_to)   overrides['first_air_date.lte'] = `${year_to}-12-31`
  if (min_vote)  { overrides['vote_average.gte'] = min_vote; overrides['vote_count.gte'] = '100' }
  if (language)  overrides.with_original_language = language

  const t = await getTranslations('pages.cartoons')
  const tf = await getTranslations('filters')
  const td = await getTranslations('dropdown')

  const categories = [
    { value: 'trending',  label: td('trending') },
    { value: 'popular',   label: td('popular') },
    { value: 'top_rated', label: td('topRated') },
    { value: 'family',    label: td('familyPicks') },
    { value: 'new',       label: td('newReleases') },
    { value: 'classics',  label: td('classics') },
  ]
  const params = buildCartoonParams(category, page, overrides)
  const r = await fetchDiscover('tv', params) as TMDBResponse<TVShow>
  const results = r.results
  const total_pages = r.total_pages

  const label = hasFilters ? tf('activeFilters') : (categories.find(c => c.value === category)?.label || td('popular'))

  const baseHref = `/cartoons?category=${category}${sort_by ? `&sort_by=${sort_by}` : ''}${year_from ? `&year_from=${year_from}` : ''}${year_to ? `&year_to=${year_to}` : ''}${min_vote ? `&min_vote=${min_vote}` : ''}${language ? `&language=${language}` : ''}`

  return (
    <div className="min-h-screen pt-14 pb-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
      <div className="mb-4 md:mb-6 pt-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-1">
          {hasFilters ? label : t('title')}
        </h1>
        {!hasFilters && (
          <p className="text-sm text-gray-900/50 dark:text-white/50 max-w-xl">{t('description')}</p>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {categories.map((cat) => (
          <Link
            key={cat.value}
            href={`/cartoons?category=${cat.value}`}
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

      <Suspense>
        <CartoonFilters
          sort_by={sort_by}
          year_from={year_from}
          year_to={year_to}
          min_vote={min_vote}
          language={language}
        />
      </Suspense>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {results.map((item, index) => (
          <MediaCard key={item.id} item={item} mediaType="tv" priority={index < 6} />
        ))}
      </div>

      {results.length === 0 && (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          {tf('noResults')}
        </div>
      )}

      <Pagination currentPage={page} totalPages={total_pages} baseHref={baseHref} />
    </div>
  )
}
