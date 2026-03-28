'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import FilterSelect from '@/components/ui/FilterSelect'

const CURRENT_YEAR = new Date().getFullYear()

interface Props {
  q: string
  year: string
  type: string
}

export default function AnimeFilters({ q, year, type }: Props) {
  const t = useTranslations('filters')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const TYPES = [
    { label: t('typeDefault'), value: '' },
    { label: 'TV', value: 'tv' },
    { label: t('typeMovie'), value: 'movie' },
    { label: 'OVA', value: 'ova' },
    { label: 'ONA', value: 'ona' },
    { label: t('typeSpecial'), value: 'special' },
  ]

  const YEARS = [
    { label: t('yearDefault'), value: '' },
    ...Array.from({ length: CURRENT_YEAR - 1989 }, (_, i) => {
      const y = String(CURRENT_YEAR - i)
      return { label: y, value: y }
    }),
  ]

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

  const hasFilters = !!(q || year || type)

  const clearAll = () => router.push(pathname)

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div
        className="flex items-center rounded-xl px-4 py-2.5 gap-3 transition-all"
        style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}
      >
        <Search size={15} className="flex-shrink-0" style={{ color: 'var(--color-text-subtle)' }} />
        <input
          type="text"
          defaultValue={q}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={t('searchAnime')}
          className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-40"
          style={{ color: 'var(--color-text)' }}
        />
        {q && (
          <button onClick={() => update('q', '')} className="flex-shrink-0 transition-colors" style={{ color: 'var(--color-text-muted)' }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect label={t('yearDefault')} value={year} options={YEARS} onChange={v => update('year', v)} />
        <FilterSelect label={t('typeDefault')} value={type} options={TYPES} onChange={v => update('type', v)} />
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
