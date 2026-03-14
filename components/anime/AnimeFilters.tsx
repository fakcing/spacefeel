'use client'

import { useState, useRef, useEffect } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

const TYPES = [
  { label: 'Все', value: '' },
  { label: 'TV', value: 'tv' },
  { label: 'Фильм', value: 'movie' },
  { label: 'OVA', value: 'ova' },
  { label: 'ONA', value: 'ona' },
  { label: 'Спэшл', value: 'special' },
]

const SORTS = [
  { label: 'По умолчанию', value: '' },
  { label: 'По рейтингу', value: 'by_rating' },
  { label: 'По году', value: 'by_year' },
  { label: 'По просмотрам', value: 'by_views' },
]

const CURRENT_YEAR = new Date().getFullYear()

interface Props {
  year: string
  type: string
  sort: string
}

export default function AnimeFilters({ year, type, sort }: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const panelRef = useRef<HTMLDivElement>(null)

  const activeCount = [year, type, sort].filter(Boolean).length

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  const clearAll = () => {
    router.push(pathname)
    setOpen(false)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(p => !p)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
          open || activeCount > 0
            ? 'bg-white text-black border-white'
            : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:border-white/20'
        }`}
      >
        <SlidersHorizontal size={14} />
        <span>Фильтры</span>
        {activeCount > 0 && (
          <span className={`flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${open ? 'bg-black text-white' : 'bg-black/80 text-white'}`}>
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white text-sm font-semibold">Фильтры</span>
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-white/40 text-xs hover:text-white/70 transition-colors"
              >
                <X size={11} />
                Сбросить
              </button>
            )}
          </div>

          {/* Type */}
          <div className="mb-4">
            <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider mb-2">Тип</p>
            <div className="flex flex-wrap gap-1.5">
              {TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => update('type', t.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    type === t.value
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="mb-4">
            <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider mb-2">Сортировка</p>
            <div className="flex flex-col gap-0.5">
              {SORTS.map(s => (
                <button
                  key={s.value}
                  onClick={() => update('sort', s.value)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                    sort === s.value
                      ? 'bg-white/15 text-white'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Year */}
          <div>
            <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider mb-2">Год</p>
            <select
              value={year}
              onChange={e => update('year', e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white text-xs px-3 py-2 rounded-lg cursor-pointer focus:outline-none hover:bg-white/10 transition-colors"
            >
              <option value="" className="bg-[#111]">Любой год</option>
              {Array.from({ length: CURRENT_YEAR - 1989 }, (_, i) => CURRENT_YEAR - i).map(y => (
                <option key={y} value={String(y)} className="bg-[#111]">{y}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
