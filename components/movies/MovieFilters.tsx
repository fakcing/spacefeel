'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useRef } from 'react'

const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
]

const SORT_OPTIONS = [
  { label: 'Сортировка', value: '' },
  { label: 'Популярные ↓', value: 'popularity.desc' },
  { label: 'Популярные ↑', value: 'popularity.asc' },
  { label: 'Рейтинг ↓', value: 'vote_average.desc' },
  { label: 'Рейтинг ↑', value: 'vote_average.asc' },
  { label: 'Новые', value: 'primary_release_date.desc' },
  { label: 'Старые', value: 'primary_release_date.asc' },
  { label: 'Кассовые', value: 'revenue.desc' },
]

const RATINGS = [
  { label: 'Рейтинг', value: '' },
  { label: '5+', value: '5' },
  { label: '6+', value: '6' },
  { label: '7+', value: '7' },
  { label: '8+', value: '8' },
  { label: '9+', value: '9' },
]

const LANGUAGES = [
  { label: 'Язык', value: '' },
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

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1899 }, (_, i) => String(CURRENT_YEAR - i))

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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedGenres = genres ? genres.split(',').filter(Boolean).map(Number) : []

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

  const hasFilters = !!(q || genres || year_from || year_to || min_vote || language || sort_by)

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString())
    ;['q', 'genres', 'sort_by', 'year_from', 'year_to', 'min_vote', 'language', 'page'].forEach(k => params.delete(k))
    router.push(`${pathname}?${params.toString()}`)
  }

  const selectClass = (active: boolean) =>
    `appearance-none cursor-pointer text-sm px-3 py-2 pr-7 rounded-xl border outline-none transition-colors bg-white dark:bg-[#111] ${
      active
        ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white font-medium'
        : 'border-black/15 dark:border-white/15 text-gray-900/60 dark:text-white/60 hover:border-black/30 dark:hover:border-white/30'
    }`

  return (
    <div className="space-y-3 mb-6 md:mb-8">
      {/* Search bar */}
      <div className="relative flex items-center border border-black/15 dark:border-white/15 rounded-xl px-4 py-2.5 gap-3 bg-black/[0.02] dark:bg-white/[0.02] focus-within:border-black/30 dark:focus-within:border-white/30 transition-colors">
        <Search size={16} className="flex-shrink-0 text-gray-900/40 dark:text-white/40" />
        <input
          type="text"
          defaultValue={q}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Поиск фильмов..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-900/30 dark:placeholder:text-white/30 text-gray-900 dark:text-white"
        />
        {q && (
          <button
            onClick={() => update({ q: '' })}
            className="flex-shrink-0 text-gray-900/40 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Genre pills */}
      <div className="flex flex-wrap gap-1.5">
        {GENRES.map(g => (
          <button
            key={g.id}
            onClick={() => toggleGenre(g.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedGenres.includes(g.id)
                ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                : 'bg-black/[0.06] dark:bg-white/[0.06] text-[var(--text-secondary,#666)] hover:bg-black/[0.12] dark:hover:bg-white/[0.12] text-gray-700 dark:text-gray-300'
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* Filter dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <select value={sort_by} onChange={e => update({ sort_by: e.target.value })} className={selectClass(!!sort_by)}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-900/40 dark:text-white/40 text-xs">▾</span>
        </div>

        <div className="relative">
          <select value={year_from} onChange={e => update({ year_from: e.target.value })} className={selectClass(!!year_from)}>
            <option value="">С года</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-900/40 dark:text-white/40 text-xs">▾</span>
        </div>

        <div className="relative">
          <select value={year_to} onChange={e => update({ year_to: e.target.value })} className={selectClass(!!year_to)}>
            <option value="">По год</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-900/40 dark:text-white/40 text-xs">▾</span>
        </div>

        <div className="relative">
          <select value={min_vote} onChange={e => update({ min_vote: e.target.value })} className={selectClass(!!min_vote)}>
            {RATINGS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-900/40 dark:text-white/40 text-xs">▾</span>
        </div>

        <div className="relative">
          <select value={language} onChange={e => update({ language: e.target.value })} className={selectClass(!!language)}>
            {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-900/40 dark:text-white/40 text-xs">▾</span>
        </div>

        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-sm px-3 py-2 rounded-xl border border-black/15 dark:border-white/15 text-gray-900/60 dark:text-white/60 hover:border-black/30 dark:hover:border-white/30 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Сброс
          </button>
        )}
      </div>
    </div>
  )
}
