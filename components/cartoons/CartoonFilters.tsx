'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import FilterSelect from '@/components/ui/FilterSelect'

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

  const hasFilters = !!(sort_by || year_from || year_to || min_vote || language)

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString())
    ;['sort_by', 'year_from', 'year_to', 'min_vote', 'language', 'page'].forEach(k => params.delete(k))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="mb-6 md:mb-8">
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
  )
}
