'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMediaPlayerStore } from '@/store/mediaPlayerStore'
import UniversalPlayer from '@/components/anime/UniversalPlayer'
import { useEffect } from 'react'

export default function MediaPlayerModal() {
  const {
    isOpen,
    mediaType,
    item,
    tmdbId,
    shikimoriId,
    season,
    episode,
    closePlayer,
    setSeason,
  } = useMediaPlayerStore()

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Keyboard close
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closePlayer() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, closePlayer])

  const handlePrevSeason = () => { if (season > 1) setSeason(season - 1) }
  const handleNextSeason = () => { setSeason(season + 1) }

  const title = item ? ('title' in item ? item.title : item.name) : 'Media Player'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col"
          style={{ backgroundColor: 'var(--color-bg)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {(mediaType === 'tv' || mediaType === 'anime') && (
              <>
                <button
                  onClick={handlePrevSeason}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-overlay)', color: 'var(--color-text)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-overlay)')}
                  title="Предыдущий сезон"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNextSeason}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-overlay)', color: 'var(--color-text)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-overlay)')}
                  title="Следующий сезон"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>{title}</span>
              <span className="text-sm" style={{ color: 'var(--color-text-subtle)' }}>·</span>
              {mediaType === 'tv' || mediaType === 'anime' ? (
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Сезон {season} · Серия {episode}
                </span>
              ) : (
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Фильм</span>
              )}
            </div>

            <button
              onClick={closePlayer}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
              style={{ backgroundColor: 'var(--color-overlay)', color: 'var(--color-text)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-overlay)')}
            >
              <X size={14} />
            </button>
          </div>

          {/* Video container */}
          <div className="flex-1 flex items-center justify-center px-2 sm:px-4 py-3 min-h-0">
            <div className="w-full max-w-5xl aspect-video rounded-lg sm:rounded-xl overflow-hidden bg-black">
              <UniversalPlayer
                type={mediaType}
                tmdbId={mediaType === 'anime' ? undefined : tmdbId || undefined}
                shikimoriId={mediaType === 'anime' ? shikimoriId || undefined : undefined}
                season={season}
                episode={episode}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
