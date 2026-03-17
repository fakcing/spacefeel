'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'

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
  { label: 'Russian', value: 'ru' },
]

interface Props {
  sort_by: string
  year_from: string
  year_to: string
  min_vote: string
  language: string
}

export default function CartoonFilters({ sort_by, year_from, year_to, min_vote, language }: Props) {
  const t = useTranslations('filters')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

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

  const hasFilters = !!(sort_by || year_from || year_to || min_vote || language)

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString())
    ;['sort_by', 'year_from', 'year_to', 'min_vote', 'language', 'page'].forEach(k => params.delete(k))
    router.push(`${pathname}?${params.toString()}`)
  }

  const selectCls = (active: boolean) =>
    `appearance-none cursor-pointer text-sm px-3 py-2 pr-7 rounded-xl border outline-none transition-all ${
      active
        ? 'border-gray-800 dark:border-white/80 bg-gray-900 dark:bg-white text-white dark:text-black font-medium'
        : 'border-black/12 dark:border-white/12 bg-black/[0.03] dark:bg-white/[0.03] text-gray-700 dark:text-gray-300 hover:border-black/25 dark:hover:border-white/25'
    }`

  return (
    <div className="mb-6 md:mb-8">
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-2.5 text-gray-400 dark:text-gray-500">
        {t('params')}
      </p>
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
  )
}
