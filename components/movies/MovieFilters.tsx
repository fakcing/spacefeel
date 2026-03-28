'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import FilterSelect from '@/components/ui/FilterSelect'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1899 }, (_, i) => String(CURRENT_YEAR - i))

const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'en' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Korean', value: 'ko' },
  { label: 'French', value: 'fr' },
  { label: 'Spanish', value: 'es' },
  { label: 'German', value: 'de' },
  { label: 'Italian', value: 'it' },
  { label: 'Chinese', value: 'zh' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Russian', value: 'ru' },
]

interface Props {
  q: string
  genres: string
  sort_by: string
  year_from: string
  year_to: string
  min_vote: string
  language: string
}

export default function MovieFilters({ q, genres, sort_by, year_from, year_to, min_vote, language }: Props) {
  const t = useTranslations('filters')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedGenres = genres ? genres.split(',').filter(Boolean).map(Number) : []

  const GENRES = [
    { id: 28,    name: t('genre_28') },
    { id: 12,    name: t('genre_12') },
    { id: 35,    name: t('genre_35') },
    { id: 80,    name: t('genre_80') },
    { id: 99,    name: t('genre_99') },
    { id: 18,    name: t('genre_18') },
    { id: 10751, name: t('genre_10751') },
    { id: 14,    name: t('genre_14') },
    { id: 36,    name: t('genre_36') },
    { id: 27,    name: t('genre_27') },
    { id: 10402, name: t('genre_10402') },
    { id: 9648,  name: t('genre_9648') },
    { id: 10749, name: t('genre_10749') },
    { id: 878,   name: t('genre_878') },
    { id: 53,    name: t('genre_53') },
    { id: 10752, name: t('genre_10752') },
    { id: 37,    name: t('genre_37') },
  ]

  const SORT_OPTIONS = [
    { label: t('sortDefault'), value: '' },
    { label: t('sortPopularDesc'), value: 'popularity.desc' },
    { label: t('sortPopularAsc'), value: 'popularity.asc' },
    { label: t('sortRatingDesc'), value: 'vote_average.desc' },
    { label: t('sortRatingAsc'), value: 'vote_average.asc' },
    { label: t('sortNewest'), value: 'primary_release_date.desc' },
    { label: t('sortOldest'), value: 'primary_release_date.asc' },
    { label: t('sortRevenue'), value: 'revenue.desc' },
  ]

  const RATINGS = [
    { label: t('ratingDefault'), value: '' },
    { label: '5+', value: '5' },
    { label: '6+', value: '6' },
    { label: '7+', value: '7' },
    { label: '8+', value: '8' },
    { label: '9+', value: '9' },
  ]

  const LANGUAGES = [
    { label: t('languageDefault'), value: '' },
    ...LANGUAGE_OPTIONS,
  ]

  const YEAR_FROM_OPTIONS = [{ label: t('yearFrom'), value: '' }, ...YEARS.map(y => ({ label: y, value: y }))]
  const YEAR_TO_OPTIONS   = [{ label: t('yearTo'),   value: '' }, ...YEARS.map(y => ({ label: y, value: y }))]

  const update = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSearch = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => update({ q: value }), 400)
  }

  const toggleGenre = (id: number) => {
    const next = selectedGenres.includes(id)
      ? selectedGenres.filter(g => g !== id)
      : [...selectedGenres, id]
    update({ genres: next.join(',') })
  }

  const hasFilters = !!(q || genres || sort_by || year_from || year_to || min_vote || language)

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString())
    ;['q', 'genres', 'sort_by', 'year_from', 'year_to', 'min_vote', 'language', 'page'].forEach(k => params.delete(k))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-4 mb-6 md:mb-8">
      {/* Search */}
      <div
        className="flex items-center rounded-xl px-4 py-2.5 gap-3 transition-all"
        style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}
      >
        <Search size={15} className="flex-shrink-0" style={{ color: 'var(--color-text-subtle)' }} />
        <input
          type="text"
          defaultValue={q}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={t('searchMovies')}
          className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-40"
          style={{ color: 'var(--color-text)' }}
        />
        {q && (
          <button onClick={() => update({ q: '' })} className="flex-shrink-0 transition-colors" style={{ color: 'var(--color-text-muted)' }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Genres */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'var(--color-text-subtle)' }}>
          {t('genres')}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {GENRES.map(g => {
            const isSelected = selectedGenres.includes(g.id)
            return (
              <button
                key={g.id}
                onClick={() => toggleGenre(g.id)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={
                  isSelected
                    ? { backgroundColor: 'var(--color-text)', border: '1px solid transparent', color: 'var(--color-bg)' }
                    : { backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }
                }
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-text-muted)'
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-border)'
                }}
              >
                {g.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Params */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'var(--color-text-subtle)' }}>
          {t('params')}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect label={t('sortDefault')} value={sort_by} options={SORT_OPTIONS} onChange={v => update({ sort_by: v })} />
          <FilterSelect label={t('yearFrom')} value={year_from} options={YEAR_FROM_OPTIONS} onChange={v => update({ year_from: v })} />
          <FilterSelect label={t('yearTo')} value={year_to} options={YEAR_TO_OPTIONS} onChange={v => update({ year_to: v })} />
          <FilterSelect label={t('ratingDefault')} value={min_vote} options={RATINGS} onChange={v => update({ min_vote: v })} />
          <FilterSelect label={t('languageDefault')} value={language} options={LANGUAGES} onChange={v => update({ language: v })} />
          {hasFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-text-muted)'
                e.currentTarget.style.color = 'var(--color-text)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.color = 'var(--color-text-muted)'
              }}
            >
              <X size={11} />
              {t('reset')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
