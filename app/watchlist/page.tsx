'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, ChevronDown, Download } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { useSession } from 'next-auth/react'
import { useWatchlistStore } from '@/store/watchlistStore'
import { WatchlistItem } from '@/types/tmdb'
import MediaCard from '@/components/cards/MediaCard'
import { Movie, TVShow } from '@/types/tmdb'

const STATUSES = ['planning', 'watching', 'completed', 'dropped'] as const
type Status = typeof STATUSES[number]

interface EnrichedItem extends WatchlistItem {
  title: string
}

function StatusPicker({ item, onUpdate }: { item: EnrichedItem; onUpdate: (status: Status) => void }) {
  const t = useTranslations('watchlistPage')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const status = (item.status ?? 'planning') as Status

  const labels: Record<Status, string> = {
    planning:  t('statusPlanning'),
    watching:  t('statusWatching'),
    completed: t('statusCompleted'),
    dropped:   t('statusDropped'),
  }

  const colors: Record<Status, string> = {
    planning:  'var(--color-text-muted)',
    watching:  '#3b82f6',
    completed: '#22c55e',
    dropped:   '#ef4444',
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative mt-1.5" ref={ref}>
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all"
        style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}
      >
        <span style={{ color: colors[status] }}>{labels[status]}</span>
        <ChevronDown
          size={10}
          style={{ color: 'var(--color-text-subtle)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.1 }}
            className="absolute bottom-full mb-1 left-0 right-0 rounded-xl p-1 z-50 shadow-2xl"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => { onUpdate(s); setOpen(false) }}
                className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors"
                style={{ color: s === status ? colors[s] : 'var(--color-text-muted)', fontWeight: s === status ? 600 : undefined }}
                onMouseEnter={e => { if (s !== status) e.currentTarget.style.backgroundColor = 'var(--color-hover)' }}
                onMouseLeave={e => { if (s !== status) e.currentTarget.style.backgroundColor = '' }}
              >
                {labels[s]}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function WatchlistPage() {
  const { items, updateStatus } = useWatchlistStore()
  const { data: session } = useSession()
  const t = useTranslations('watchlistPage')
  const locale = useLocale()
  const [enriched, setEnriched] = useState<EnrichedItem[]>([])
  const [filter, setFilter] = useState<'all' | Status>('all')

  useEffect(() => {
    if (!items.length) { setEnriched([]); return }
    Promise.all(
      items.map(async (item) => {
        const data = await fetch(
          `/api/media-detail?id=${item.id}&type=${item.media_type}&locale=${locale}`
        ).then(r => r.json())
        return { ...item, title: data.title || '' }
      })
    ).then(setEnriched).catch(() => {})
  }, [items, locale])

  const filtered = filter === 'all'
    ? enriched
    : enriched.filter(i => (i.status ?? 'planning') === filter)

  const handleStatusUpdate = (item: EnrichedItem, status: Status) => {
    updateStatus(item.id, item.media_type, status, !!session)
    setEnriched(prev => prev.map(i =>
      i.id === item.id && i.media_type === item.media_type ? { ...i, status } : i
    ))
  }

  const exportJSON = () => {
    const data = enriched.map(i => ({
      id: i.id,
      title: i.title,
      mediaType: i.media_type,
      status: i.status ?? 'planning',
      rating: i.vote_average,
      releaseDate: i.release_date,
    }))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'watchlist.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const exportCSV = () => {
    const header = 'id,title,mediaType,status,rating,releaseDate'
    const rows = enriched.map(i =>
      [i.id, `"${(i.title ?? '').replace(/"/g, '""')}"`, i.media_type, i.status ?? 'planning', i.vote_average, i.release_date].join(',')
    )
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'watchlist.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const FILTER_TABS: Array<{ value: 'all' | Status; label: string }> = [
    { value: 'all',       label: t('filterAll') },
    { value: 'planning',  label: t('statusPlanning') },
    { value: 'watching',  label: t('statusWatching') },
    { value: 'completed', label: t('statusCompleted') },
    { value: 'dropped',   label: t('statusDropped') },
  ]

  return (
    <div className="min-h-screen pt-20 pb-24 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Bookmark size={28} />
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">{t('title')}</h1>
        {enriched.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={exportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
              style={{ backgroundColor: 'var(--color-overlay)', color: 'var(--color-text-muted)' }}
              title="Export JSON"
            >
              <Download size={12} />
              JSON
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
              style={{ backgroundColor: 'var(--color-overlay)', color: 'var(--color-text-muted)' }}
              title="Export CSV"
            >
              <Download size={12} />
              CSV
            </button>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-colors ${
                filter === tab.value
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-black font-semibold'
                  : 'bg-black/[0.08] dark:bg-white/[0.08] hover:bg-black/[0.15] dark:hover:bg-white/[0.15] text-[var(--text-muted)]'
              }`}
            >
              {tab.label}
              {tab.value !== 'all' && (
                <span className="ml-1.5 text-[10px] opacity-60">
                  {enriched.filter(i => (i.status ?? 'planning') === tab.value).length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          >
            <Bookmark size={96} className="text-[var(--text-muted)] opacity-20 mb-6" />
          </motion.div>
          <h2 className="text-xl font-semibold text-[var(--text-muted)] mb-2">{t('empty')}</h2>
          <Link
            href="/movies"
            className="bg-gray-900 dark:bg-white text-white dark:text-black font-semibold rounded-full px-8 py-3 hover:bg-gray-800 dark:hover:bg-white/90 transition-colors mt-8"
          >
            {t('browse')}
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          {t('empty')}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item) => {
            const cardContent = item.media_type === 'anime' ? (
              <a key={item.id} href={item.slug ? `/anime/${item.slug}` : '/anime'} className="group relative block w-full">
                <div className="relative aspect-[2/3] rounded-lg md:rounded-xl overflow-hidden bg-black/5 dark:bg-white/5">
                  {item.poster_path && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.poster_path} alt={item.title} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-white text-xs font-semibold line-clamp-2">{item.title}</p>
                  </div>
                </div>
              </a>
            ) : (
              <MediaCard
                key={item.id}
                item={{
                  id: item.id,
                  ...(item.media_type === 'movie'
                    ? { title: item.title, original_title: item.title, release_date: item.release_date }
                    : { name: item.title, original_name: item.title, first_air_date: item.release_date }),
                  overview: '',
                  poster_path: item.poster_path,
                  backdrop_path: null,
                  vote_average: item.vote_average,
                  vote_count: 0,
                  genre_ids: [],
                } as Movie | TVShow}
                mediaType={item.media_type as 'movie' | 'tv'}
              />
            )

            return (
              <div key={`${item.id}-${item.media_type}`}>
                {cardContent}
                <StatusPicker item={item} onUpdate={(s) => handleStatusUpdate(item, s)} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
