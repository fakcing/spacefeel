'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAniPlayerStore } from '@/store/aniPlayerStore'
import { useEffect, useMemo } from 'react'

export default function AniPlayerModal() {
  const {
    isOpen, episodes, titleName,
    currentEpisode, quality,
    closePlayer, setEpisode, setQuality,
  } = useAniPlayerStore()

  const episodeData = useMemo(
    () => episodes.find((e) => e.ordinal === currentEpisode),
    [episodes, currentEpisode]
  )

  const streamUrl = useMemo(() => {
    if (!episodeData) return null
    return episodeData[quality] || episodeData.hls_720 || episodeData.hls_480
  }, [episodeData, quality])

  const prevEp = episodes.find((e) => e.ordinal === currentEpisode - 1)
  const nextEp = episodes.find((e) => e.ordinal === currentEpisode + 1)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePlayer()
      if (e.key === 'ArrowLeft' && prevEp) setEpisode(prevEp.ordinal)
      if (e.key === 'ArrowRight' && nextEp) setEpisode(nextEp.ordinal)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closePlayer, prevEp, nextEp, setEpisode])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black/98 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-white font-semibold">{titleName}</span>
              <span className="text-white/40 text-sm">Серия {currentEpisode}</span>
            </div>

            {/* Quality selector + close */}
            <div className="flex items-center gap-3">
              {(['hls_1080', 'hls_720', 'hls_480'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  disabled={!episodeData?.[q]}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                    quality === q
                      ? 'bg-white text-black'
                      : 'text-white/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed'
                  }`}
                >
                  {q === 'hls_1080' ? '1080p' : q === 'hls_720' ? '720p' : '480p'}
                </button>
              ))}

              <button
                onClick={closePlayer}
                className="ml-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
          </div>

          {/* Player */}
          <div className="flex-1 flex items-center justify-center px-6 pb-4 min-h-0">
            <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden bg-black">
              {streamUrl ? (
                <video
                  key={streamUrl}
                  src={streamUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                  controlsList="nodownload"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white/30">
                  Нет доступного стрима
                </div>
              )}
            </div>
          </div>

          {/* Episode navigation */}
          <div className="flex-shrink-0 px-6 pb-6">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => prevEp && setEpisode(prevEp.ordinal)}
                disabled={!prevEp}
                className="p-1.5 rounded-lg bg-white/10 disabled:opacity-30 hover:bg-white/20 transition-colors"
              >
                <ChevronLeft size={16} className="text-white" />
              </button>
              <button
                onClick={() => nextEp && setEpisode(nextEp.ordinal)}
                disabled={!nextEp}
                className="p-1.5 rounded-lg bg-white/10 disabled:opacity-30 hover:bg-white/20 transition-colors"
              >
                <ChevronRight size={16} className="text-white" />
              </button>
              <span className="text-white/40 text-xs ml-2">{episodes.length} серий</span>
            </div>

            {/* Episode pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {episodes.map((ep) => (
                <button
                  key={ep.ordinal}
                  onClick={() => setEpisode(ep.ordinal)}
                  className={`flex-shrink-0 w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                    currentEpisode === ep.ordinal
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {ep.ordinal}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
