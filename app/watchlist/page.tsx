'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, ChevronDown, Download, Film, Tv2, Wand2 } from 'lucide-react'
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

const STATUS_COLORS: Record<Status, string> = {
  planning:  'var(--color-text-muted)',
  watching:  '#3b82f6',
  completed: '#22c55e',
  dropped:   '#ef4444',
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
        <span style={{ color: STATUS_COLORS[status] }}>{labels[status]}</span>
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
                style={{ color: s === status ? STATUS_COLORS[s] : 'var(--color-text-muted)', fontWeight: s === status ? 600 : undefined }}
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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!items.length) { setEnriched([]); return }
    setLoading(true)
    Promise.all(
      items.map(async (item) => {
        const data = await fetch(
          `/api/media-detail?id=${item.id}&type=${item.media_type}&locale=${locale}`
        ).then(r => r.json())
        return { ...item, title: data.title || '' }
      })
    ).then(r => { setEnriched(r); setLoading(false) }).catch(() => setLoading(false))
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
    const data = enriched.map(i => ({ id: i.id, title: i.title, mediaType: i.media_type, status: i.status ?? 'planning', rating: i.vote_average, releaseDate: i.release_date }))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'watchlist.json'; a.click(); URL.revokeObjectURL(a.href)
  }

  const exportCSV = () => {
    const header = 'id,title,mediaType,status,rating,releaseDate'
    const rows = enriched.map(i => [i.id, `"${(i.title ?? '').replace(/"/g, '""')}"`, i.media_type, i.status ?? 'planning', i.vote_average, i.release_date].join(','))
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'watchlist.csv'; a.click(); URL.revokeObjectURL(a.href)
  }

  const FILTER_TABS: Array<{ value: 'all' | Status; label: string; count?: number }> = [
    { value: 'all',       label: t('filterAll'), count: enriched.length },
    { value: 'planning',  label: t('statusPlanning'),  count: enriched.filter(i => (i.status ?? 'planning') === 'planning').length },
    { value: 'watching',  label: t('statusWatching'),  count: enriched.filter(i => i.status === 'watching').length },
    { value: 'completed', label: t('statusCompleted'), count: enriched.filter(i => i.status === 'completed').length },
    { value: 'dropped',   label: t('statusDropped'),   count: enriched.filter(i => i.status === 'dropped').length },
  ]

  const isEmpty = items.length === 0

  return (
    <div className="min-h-screen">
      {/* Page header — matches home page style */}
      <div className="relative pt-20 pb-8 overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(to bottom, var(--color-overlay) 0%, transparent 100%)',
        }} />
        <div className="relative px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}>
                  <Bookmark size={20} style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.05em' }}>
                  {t('title')}
                </h1>
              </div>
              {!isEmpty && (
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  {STATUSES.map(s => {
                    const count = enriched.filter(i => (i.status ?? 'planning') === s).length
                    if (count === 0) return null
                    return (
                      <span key={s} className="flex items-center gap-1.5 text-sm">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[s] }} />
                        <span style={{ color: 'var(--color-text-muted)' }}>{count}</span>
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
            {enriched.length > 0 && (
              <div className="flex items-center gap-2">
                <button onClick={exportJSON} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors" style={{ backgroundColor: 'var(--color-overlay)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-hover)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-overlay)'}
                >
                  <Download size={12} /> JSON
                </button>
                <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors" style={{ backgroundColor: 'var(--color-overlay)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-hover)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-overlay)'}
                >
                  <Download size={12} /> CSV
                </button>
              </div>
            )}
          </div>

          {/* Filter tabs */}
          {!isEmpty && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide mt-6 -mx-4 px-4 md:mx-0 md:px-0">
              {FILTER_TABS.map(tab => {
                const isActive = filter === tab.value
                return (
                  <button
                    key={tab.value}
                    onClick={() => setFilter(tab.value)}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
                    style={{
                      backgroundColor: isActive ? 'var(--color-text)' : 'var(--color-overlay)',
                      color: isActive ? 'var(--color-bg)' : 'var(--color-text-muted)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="text-[10px] font-bold rounded-full px-1.5 py-0.5" style={{
                        backgroundColor: isActive ? 'var(--color-bg)' : 'var(--color-border-strong)',
                        color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                        opacity: isActive ? 0.6 : 1,
                      }}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-8 max-w-7xl mx-auto pb-24">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
              <Bookmark size={72} className="mb-6 opacity-10" style={{ color: 'var(--color-text)' }} />
            </motion.div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>{t('empty')}</h2>
            <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>{t('emptyHint') || 'Start by browsing movies and TV shows'}</p>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <Link href="/movies" className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-colors" style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }}>
                <Film size={16} /> {t('browseMovies') || 'Movies'}
              </Link>
              <Link href="/tv" className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-colors" style={{ backgroundColor: 'var(--color-overlay)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                <Tv2 size={16} /> {t('browseTv') || 'TV Shows'}
              </Link>
              <Link href="/anime" className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-colors" style={{ backgroundColor: 'var(--color-overlay)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                <Wand2 size={16} /> Anime
              </Link>
            </div>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="aspect-[2/3] rounded-xl shimmer" />
                <div className="h-5 rounded shimmer" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((item) => {
              const cardItem = item.media_type === 'anime' ? null : {
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
              } as Movie | TVShow

              return (
                <div key={`${item.id}-${item.media_type}`}>
                  {item.media_type === 'anime' ? (
                    <a href={item.slug ? `/anime/${item.slug}` : '/anime'} className="group relative block w-full">
                      <div className="relative aspect-[2/3] rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--color-overlay)' }}>
                        {item.poster_path && <img src={item.poster_path} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <p className="text-white text-xs font-semibold line-clamp-2">{item.title}</p>
                        </div>
                      </div>
                    </a>
                  ) : cardItem ? (
                    <MediaCard item={cardItem} mediaType={item.media_type as 'movie' | 'tv'} />
                  ) : null}
                  <StatusPicker item={item} onUpdate={(s) => handleStatusUpdate(item, s)} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
