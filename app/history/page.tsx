'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Film, Trash2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { getPoster } from '@/lib/tmdbImages'

interface HistoryRecord {
  id: string
  tmdbId: number
  mediaType: string
  posterPath: string | null
  season: number | null
  episode: number | null
  watchedAt: string
}

export default function HistoryPage() {
  const t = useTranslations('historyPage')
  const [items, setItems] = useState<HistoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    fetch('/api/history')
      .then((r) => r.json())
      .then((data) => {
        // Deduplicate: keep latest per tmdbId+mediaType
        const seen = new Set<string>()
        const deduped = (data as HistoryRecord[]).filter((item) => {
          const key = `${item.mediaType}-${item.tmdbId}`
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        setItems(deduped)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleRemove = async (tmdbId: number, mediaType: string) => {
    await fetch(`/api/history?tmdbId=${tmdbId}&mediaType=${mediaType}`, { method: 'DELETE' })
    setItems((prev) => prev.filter((i) => !(i.tmdbId === tmdbId && i.mediaType === mediaType)))
  }

  const handleClearAll = async () => {
    await fetch('/api/history', { method: 'DELETE' })
    setItems([])
    setConfirmClear(false)
  }

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <main className="min-h-screen pt-20 pb-16 px-4 md:px-12 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
          {t('title')}
        </h1>
        {items.length > 0 && (
          <div className="flex items-center gap-2">
            {confirmClear ? (
              <>
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('confirmClear')}</span>
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1.5 rounded-xl text-sm font-medium text-red-500 border border-red-500/30 hover:bg-red-500/10 transition-colors"
                >
                  {t('clearAll')}
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="p-1.5 rounded-xl transition-colors"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-colors"
                style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-overlay)' }}
              >
                <Trash2 size={14} />
                {t('clearAll')}
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl animate-pulse" style={{ backgroundColor: 'var(--color-overlay)' }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Film size={48} className="mb-4 opacity-20" style={{ color: 'var(--color-text-muted)' }} />
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--color-text)' }}>{t('empty')}</p>
          <Link href="/movies" className="text-sm underline" style={{ color: 'var(--color-text-muted)' }}>
            {t('browse')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {items.map((item) => {
            const href = item.mediaType === 'movie' ? `/movies/${item.tmdbId}` : `/tv/${item.tmdbId}`
            const poster = item.posterPath ? getPoster(item.posterPath, 'w185') : null
            return (
              <div key={`${item.mediaType}-${item.tmdbId}`} className="group relative">
                <Link href={href}>
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--color-overlay)' }}>
                    {poster ? (
                      <Image
                        src={poster}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        alt=""
                        sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 16vw, 12vw"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film size={20} style={{ color: 'var(--color-text-subtle)' }} />
                      </div>
                    )}
                    {/* Progress badge */}
                    {item.season && item.episode && (
                      <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 text-[9px] text-white font-semibold bg-gradient-to-t from-black/80 to-transparent text-center">
                        S{item.season}E{item.episode}
                      </div>
                    )}
                  </div>
                </Link>

                {/* Date + remove */}
                <p className="text-[10px] mt-1 truncate" style={{ color: 'var(--color-text-subtle)' }}>
                  {formatDate(item.watchedAt)}
                </p>

                {/* Remove button */}
                <button
                  onClick={() => handleRemove(item.tmdbId, item.mediaType)}
                  className="absolute top-1 right-1 p-1 rounded-lg bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                  title={t('remove')}
                >
                  <X size={12} className="text-white" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
