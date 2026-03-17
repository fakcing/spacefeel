'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useRef } from 'react'
import { useTranslations } from 'next-intl'

const GENRES = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 35,    name: 'Comedy' },
  { id: 80,    name: 'Crime' },
  { id: 99,    name: 'Documentary' },
  { id: 18,    name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648,  name: 'Mystery' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 53,    name: 'Thriller' },
  { id: 10768, name: 'War & Politics' },
  { id: 37,    name: 'Western' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1939 }, (_, i) => String(CURRENT_YEAR - i))

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

export default function TVFilters({ q, genres, sort_by, year_from, year_to, min_vote, language }: Props) {
  const t = useTranslations('filters')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedGenres = genres ? genres.split(',').filter(Boolean).map(Number) : []

  const SORT_OPTIONS = [
    { label: t('sortDefault'), value: '' },
    { label: t('sortPopularDesc'), value: 'popularity.desc' },
    { label: t('sortPopularAsc'), value: 'popularity.asc' },
    { label: t('sortRatingDesc'), value: 'vote_average.desc' },
    { label: t('sortRatingAsc'), value: 'vote_average.asc' },
    { label: t('sortNewest'), value: 'first_air_date.desc' },
    { label: t('sortOldest'), value: 'first_air_date.asc' },
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

  const selectCls = (active: boolean) =>
    `appearance-none cursor-pointer text-sm px-3 py-2 pr-7 rounded-xl border outline-none transition-all ${
      active
        ? 'border-gray-800 dark:border-white/80 bg-gray-900 dark:bg-white text-white dark:text-black font-medium'
        : 'border-black/12 dark:border-white/12 bg-black/[0.03] dark:bg-white/[0.03] text-gray-700 dark:text-gray-300 hover:border-black/25 dark:hover:border-white/25'
    }`

  const SectionLabel = ({ children }: { children: string }) => (
    <p className="text-[10px] font-semibold uppercase tracking-widest mb-2.5 text-gray-400 dark:text-gray-500">
      {children}
    </p>
  )

  return (
    <div className="space-y-4 mb-6 md:mb-8">
      {/* Search */}
      <div className="relative flex items-center border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 gap-3 bg-black/[0.02] dark:bg-white/[0.02] focus-within:border-black/25 dark:focus-within:border-white/25 focus-within:bg-black/[0.04] dark:focus-within:bg-white/[0.04] transition-all">
        <Search size={15} className="flex-shrink-0 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          defaultValue={q}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={t('searchTV')}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white"
        />
        {q && (
          <button onClick={() => update({ q: '' })} className="flex-shrink-0 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Genres */}
      <div>
        <SectionLabel>{t('genres')}</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {GENRES.map(g => (
            <button
              key={g.id}
              onClick={() => toggleGenre(g.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                selectedGenres.includes(g.id)
                  ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-black'
                  : 'border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] text-gray-600 dark:text-gray-400 hover:border-black/25 dark:hover:border-white/25 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dropdowns */}
      <div>
        <SectionLabel>{t('params')}</SectionLabel>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select value={sort_by} onChange={e => update({ sort_by: e.target.value })} className={selectCls(!!sort_by)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] opacity-50">▾</span>
          </div>

          <div className="relative">
            <select value={year_from} onChange={e => update({ year_from: e.target.value })} className={selectCls(!!year_from)}>
              <option value="">{t('yearFrom')}</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] opacity-50">▾</span>
          </div>

          <div className="relative">
            <select value={year_to} onChange={e => update({ year_to: e.target.value })} className={selectCls(!!year_to)}>
              <option value="">{t('yearTo')}</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] opacity-50">▾</span>
          </div>

          <div className="relative">
            <select value={min_vote} onChange={e => update({ min_vote: e.target.value })} className={selectCls(!!min_vote)}>
              {RATINGS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] opacity-50">▾</span>
          </div>

          <div className="relative">
            <select value={language} onChange={e => update({ language: e.target.value })} className={selectCls(!!language)}>
              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] opacity-50">▾</span>
          </div>

          {hasFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-black/25 dark:hover:border-white/25 hover:text-gray-900 dark:hover:text-white transition-all"
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
