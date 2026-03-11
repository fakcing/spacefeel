'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMediaPlayerStore } from '@/store/mediaPlayerStore'
import UniversalPlayer from '@/components/anime/UniversalPlayer'

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

  // Handle season change
  const handlePrevSeason = () => {
    if (season > 1) setSeason(season - 1)
  }

  const handleNextSeason = () => {
    setSeason(season + 1)
  }

  const title = item ? ('title' in item ? item.title : item.name) : 'Media Player'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b border-white/10">
            {(mediaType === 'tv' || mediaType === 'anime') && (
              <>
                <button
                  onClick={handlePrevSeason}
                  className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
                  title="Предыдущий сезон"
                >
                  <ChevronLeft size={16} className="text-white" />
                </button>
                <button
                  onClick={handleNextSeason}
                  className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
                  title="Следующий сезон"
                >
                  <ChevronRight size={16} className="text-white" />
                </button>
              </>
            )}

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-white font-semibold text-sm truncate">{title}</span>
              <span className="text-white/40 text-sm">·</span>
              {mediaType === 'tv' || mediaType === 'anime' ? (
                <span className="text-white/80 text-sm">
                  Сезон {season} · Серия {episode}
                </span>
              ) : (
                <span className="text-white/80 text-sm">Фильм</span>
              )}
            </div>

            <button
              onClick={closePlayer}
              className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
            >
              <X size={14} className="text-white" />
            </button>
          </div>

          {/* Video container */}
          <div className="flex-1 flex items-center justify-center px-2 sm:px-4 py-3 min-h-0">
            <div className="w-full max-w-5xl aspect-video rounded-lg sm:rounded-xl overflow-hidden bg-black">
              <UniversalPlayer
                type={mediaType}
                tmdbId={tmdbId || undefined}
                shikimoriId={shikimoriId || undefined}
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
