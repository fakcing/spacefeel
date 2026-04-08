'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Film, Trash2, X, Clock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { useAuthModalStore } from '@/store/authModalStore'
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
  const tProfile = useTranslations('profile')
  const { data: session, status } = useSession()
  const { open: openAuthModal } = useAuthModalStore()
  const [items, setItems] = useState<HistoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) { setLoading(false); return }
    fetch('/api/history')
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) { setLoading(false); return }
        const seen = new Set<string>()
        const deduped = (data as HistoryRecord[]).filter(item => {
          const key = `${item.mediaType}-${item.tmdbId}`
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        setItems(deduped)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [status, session])

  const handleRemove = async (tmdbId: number, mediaType: string) => {
    await fetch(`/api/history?tmdbId=${tmdbId}&mediaType=${mediaType}`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => !(i.tmdbId === tmdbId && i.mediaType === mediaType)))
  }

  const handleClearAll = async () => {
    await fetch('/api/history', { method: 'DELETE' })
    setItems([])
    setConfirmClear(false)
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="relative pt-20 pb-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(to bottom, var(--color-overlay) 0%, transparent 100%)',
        }} />
        <div className="relative px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}>
                <Clock size={20} style={{ color: 'var(--color-text-muted)' }} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.05em' }}>
                  {t('title')}
                </h1>
                {items.length > 0 && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {items.length} {t('items') || 'titles'}
                  </p>
                )}
              </div>
            </div>

            {items.length > 0 && (
              <div className="flex items-center gap-2">
                {confirmClear ? (
                  <>
                    <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('confirmClear')}</span>
                    <button onClick={handleClearAll} className="px-3 py-1.5 rounded-xl text-sm font-medium transition-colors" style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                      {t('clearAll')}
                    </button>
                    <button onClick={() => setConfirmClear(false)} className="p-1.5 rounded-xl transition-colors" style={{ color: 'var(--color-text-muted)' }}>
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <button onClick={() => setConfirmClear(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors"
                    style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-hover)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-overlay)'}
                  >
                    <Trash2 size={14} />
                    {t('clearAll')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-8 max-w-7xl mx-auto pb-24">
        {!session && !loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
              <Clock size={72} className="mb-6 opacity-10" style={{ color: 'var(--color-text)' }} />
            </motion.div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>{t('empty')}</h2>
            <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>{t('loginHint') || 'Sign in to track what you watch'}</p>
            <button onClick={openAuthModal} className="px-8 py-3 rounded-full text-sm font-semibold transition-colors"
              style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }}>
              {tProfile('login')}
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-xl shimmer" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
              <Film size={72} className="mb-6 opacity-10" style={{ color: 'var(--color-text)' }} />
            </motion.div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>{t('empty')}</h2>
            <Link href="/movies" className="mt-6 px-8 py-3 rounded-full text-sm font-semibold transition-colors inline-block"
              style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }}>
              {t('browse')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {items.map(item => {
              const href = item.mediaType === 'movie' ? `/movies/${item.tmdbId}` : `/tv/${item.tmdbId}`
              const poster = item.posterPath ? getPoster(item.posterPath, 'w185') : null
              return (
                <div key={`${item.mediaType}-${item.tmdbId}`} className="group relative">
                  <Link href={href}>
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden"
                      style={{ backgroundColor: 'var(--color-overlay)' }}>
                      {poster ? (
                        <Image
                          src={poster}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          alt=""
                          sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 16vw, 12vw"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film size={20} style={{ color: 'var(--color-text-subtle)' }} />
                        </div>
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {/* Episode badge */}
                      {item.season && item.episode && (
                        <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 text-[9px] text-white font-semibold bg-gradient-to-t from-black/80 to-transparent text-center">
                          S{item.season}E{item.episode}
                        </div>
                      )}
                    </div>
                  </Link>
                  <p className="text-[10px] mt-1 truncate" style={{ color: 'var(--color-text-subtle)' }}>
                    {formatDate(item.watchedAt)}
                  </p>
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(item.tmdbId, item.mediaType)}
                    className="absolute top-1 right-1 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
                    title={t('remove')}
                  >
                    <X size={12} className="text-white" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
