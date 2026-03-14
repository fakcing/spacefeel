'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useRef } from 'react'

const SEASONS = [
  { label: 'Сезон', value: '' },
  { label: 'Зима', value: 'winter' },
  { label: 'Весна', value: 'spring' },
  { label: 'Лето', value: 'summer' },
  { label: 'Осень', value: 'fall' },
]

const GENRES = [
  { label: 'Жанр', value: '' },
  { label: 'Экшен', value: 'action' },
  { label: 'Романтика', value: 'romance' },
  { label: 'Комедия', value: 'comedy' },
  { label: 'Драма', value: 'drama' },
  { label: 'Фэнтези', value: 'fantasy' },
  { label: 'Ужасы', value: 'horror' },
  { label: 'Мистика', value: 'mystery' },
  { label: 'Психологическое', value: 'psychological' },
  { label: 'Спорт', value: 'sport' },
  { label: 'Сверхъестественное', value: 'supernatural' },
  { label: 'Школа', value: 'school' },
  { label: 'Приключения', value: 'adventure' },
  { label: 'Меха', value: 'mecha' },
  { label: 'Сёнен', value: 'shounen' },
  { label: 'Сёдзё', value: 'shoujo' },
  { label: 'Повседневность', value: 'slice_of_life' },
]

const TYPES = [
  { label: 'Тип', value: '' },
  { label: 'TV', value: 'tv' },
  { label: 'Фильм', value: 'movie' },
  { label: 'OVA', value: 'ova' },
  { label: 'ONA', value: 'ona' },
  { label: 'Спэшл', value: 'special' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = [
  { label: 'Год', value: '' },
  ...Array.from({ length: CURRENT_YEAR - 1989 }, (_, i) => {
    const y = String(CURRENT_YEAR - i)
    return { label: y, value: y }
  }),
]

interface Props {
  q: string
  year: string
  type: string
  season: string
  genre: string
}

export default function AnimeFilters({ q, year, type, season, genre }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSearch = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => update('q', value), 400)
  }

  const hasFilters = !!(q || year || type || season || genre)

  const clearAll = () => router.push(pathname)

  const selectClass = (active: boolean) =>
    `appearance-none cursor-pointer text-sm px-3 py-2 pr-7 rounded-xl border outline-none transition-colors bg-white dark:bg-[#111] ${
      active
        ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white font-medium'
        : 'border-black/15 dark:border-white/15 text-gray-900/60 dark:text-white/60 hover:border-black/30 dark:hover:border-white/30'
    }`

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative flex items-center border border-black/15 dark:border-white/15 rounded-xl px-4 py-2.5 gap-3 bg-black/[0.02] dark:bg-white/[0.02] focus-within:border-black/30 dark:focus-within:border-white/30 transition-colors">
        <Search size={16} className="flex-shrink-0 text-gray-900/40 dark:text-white/40" />
        <input
          type="text"
          defaultValue={q}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Поиск аниме..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-900/30 dark:placeholder:text-white/30 text-gray-900 dark:text-white"
        />
        {q && (
          <button onClick={() => update('q', '')} className="flex-shrink-0 text-gray-900/40 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <select value={season} onChange={e => update('season', e.target.value)} className={selectClass(!!season)}>
            {SEASONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-900/40 dark:text-white/40 text-xs">▾</span>
        </div>

        <div className="relative">
          <select value={genre} onChange={e => update('genre', e.target.value)} className={selectClass(!!genre)}>
            {GENRES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-900/40 dark:text-white/40 text-xs">▾</span>
        </div>

        <div className="relative">
          <select value={year} onChange={e => update('year', e.target.value)} className={selectClass(!!year)}>
            {YEARS.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-900/40 dark:text-white/40 text-xs">▾</span>
        </div>

        <div className="relative">
          <select value={type} onChange={e => update('type', e.target.value)} className={selectClass(!!type)}>
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
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
