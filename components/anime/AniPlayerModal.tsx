'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAniPlayerStore } from '@/store/aniPlayerStore'
import { useEffect, useMemo, useRef } from 'react'

export default function AniPlayerModal() {
  const {
    isOpen, episodes, titleName,
    currentEpisode, quality,
    closePlayer, setEpisode, setQuality,
  } = useAniPlayerStore()

  const pillsRef = useRef<HTMLDivElement>(null)

  const episodeData = useMemo(
    () => episodes.find((e) => e.ordinal === currentEpisode),
    [episodes, currentEpisode]
  )

  const streamUrl = useMemo(() => {
    if (!episodeData) return null
    return episodeData[quality] || episodeData.hls_720 || episodeData.hls_480
  }, [episodeData, quality])

  const currentIndex = episodes.findIndex((e) => e.ordinal === currentEpisode)
  const prevEp = currentIndex > 0 ? episodes[currentIndex - 1] : null
  const nextEp = currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null

  // Scroll active pill into view
  useEffect(() => {
    if (!pillsRef.current) return
    const active = pillsRef.current.querySelector('[data-active="true"]') as HTMLElement
    if (active) active.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [currentEpisode])

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
          className="fixed inset-0 z-[100] bg-black flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b border-white/10">
            {/* Prev / Next episode */}
            <button
              onClick={() => prevEp && setEpisode(prevEp.ordinal)}
              disabled={!prevEp}
              className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 disabled:opacity-25 transition-colors flex-shrink-0"
            >
              <ChevronLeft size={16} className="text-white" />
            </button>
            <button
              onClick={() => nextEp && setEpisode(nextEp.ordinal)}
              disabled={!nextEp}
              className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 disabled:opacity-25 transition-colors flex-shrink-0"
            >
              <ChevronRight size={16} className="text-white" />
            </button>

            {/* Title + episode */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-white font-semibold text-sm truncate">{titleName}</span>
              <span className="text-white/40 text-sm flex-shrink-0">· Серия {currentEpisode}</span>
            </div>

            {/* Quality */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {(['hls_1080', 'hls_720', 'hls_480'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  disabled={!episodeData?.[q]}
                  className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
                    quality === q
                      ? 'bg-white text-black'
                      : 'text-white/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed'
                  }`}
                >
                  {q === 'hls_1080' ? '1080p' : q === 'hls_720' ? '720p' : '480p'}
                </button>
              ))}
            </div>

            {/* Close */}
            <button
              onClick={closePlayer}
              className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
            >
              <X size={14} className="text-white" />
            </button>
          </div>

          {/* Video */}
          <div className="flex-1 flex items-center justify-center px-4 py-3 min-h-0">
            <div className="w-full max-w-5xl aspect-video rounded-xl overflow-hidden bg-black">
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
                <div className="flex items-center justify-center h-full text-white/30 text-sm">
                  Нет доступного стрима
                </div>
              )}
            </div>
          </div>

          {/* Episode pills */}
          <div className="flex-shrink-0 px-4 pb-4">
            <div
              ref={pillsRef}
              className="flex gap-1.5 overflow-x-auto pb-1"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}
            >
              {episodes.map((ep) => (
                <button
                  key={ep.ordinal}
                  data-active={currentEpisode === ep.ordinal}
                  onClick={() => setEpisode(ep.ordinal)}
                  className={`flex-shrink-0 w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
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
