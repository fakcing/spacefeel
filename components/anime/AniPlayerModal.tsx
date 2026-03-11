'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { useAniPlayerStore } from '@/store/aniPlayerStore'
import { useEffect, useMemo, useState } from 'react'

export default function AniPlayerModal() {
  const {
    isOpen, videos, titleName,
    currentDubbing, currentEpisode,
    closePlayer, setDubbing, setEpisode,
  } = useAniPlayerStore()

  const [showEpisodeDropdown, setShowEpisodeDropdown] = useState(false)
  const [showDubbingDropdown, setShowDubbingDropdown] = useState(false)

  // Unique dubbing options in order of first appearance
  const dubbings = useMemo(
    () => Array.from(new Set(videos.map((v) => v.data.dubbing))),
    [videos]
  )

  // Episodes for selected dubbing
  const dubVideos = useMemo(
    () => videos.filter((v) => v.data.dubbing === currentDubbing)
      .sort((a, b) => Number(a.number) - Number(b.number)),
    [videos, currentDubbing]
  )

  const currentVideo = useMemo(
    () => dubVideos.find((v) => v.number === currentEpisode),
    [dubVideos, currentEpisode]
  )

  const iframeSrc = useMemo(() => {
    if (!currentVideo?.iframe_url) return null
    const url = currentVideo.iframe_url
    return url.startsWith('//') ? `https:${url}` : url
  }, [currentVideo])

  const currentIndex = dubVideos.findIndex((v) => v.number === currentEpisode)
  const prevEp = currentIndex > 0 ? dubVideos[currentIndex - 1] : null
  const nextEp = currentIndex < dubVideos.length - 1 ? dubVideos[currentIndex + 1] : null

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePlayer()
      if (e.key === 'ArrowLeft' && prevEp) setEpisode(prevEp.number)
      if (e.key === 'ArrowRight' && nextEp) setEpisode(nextEp.number)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closePlayer, prevEp, nextEp, setEpisode])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest('[data-dropdown]')) {
        setShowEpisodeDropdown(false)
        setShowDubbingDropdown(false)
      }
    }
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [])

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
            <button
              onClick={() => prevEp && setEpisode(prevEp.number)}
              disabled={!prevEp}
              className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 disabled:opacity-25 transition-colors flex-shrink-0"
            >
              <ChevronLeft size={16} className="text-white" />
            </button>
            <button
              onClick={() => nextEp && setEpisode(nextEp.number)}
              disabled={!nextEp}
              className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 disabled:opacity-25 transition-colors flex-shrink-0"
            >
              <ChevronRight size={16} className="text-white" />
            </button>

            <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
              <span className="text-white font-semibold text-sm truncate">{titleName}</span>
              <span className="text-white/40 text-sm">·</span>

              {/* Episode selector */}
              <div className="relative" data-dropdown>
                <button
                  onClick={() => setShowEpisodeDropdown(!showEpisodeDropdown)}
                  className="flex items-center gap-1 text-sm px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <span>Серия {currentEpisode}</span>
                  <ChevronDown size={12} className={`transition-transform ${showEpisodeDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showEpisodeDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full mt-1 left-0 bg-[#1a1a1b] border border-white/20 rounded-lg shadow-xl z-50 min-w-[80px] max-h-64 overflow-y-auto"
                  >
                    {dubVideos.map((ep) => (
                      <button
                        key={ep.video_id}
                        onClick={() => { setEpisode(ep.number); setShowEpisodeDropdown(false) }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                          currentEpisode === ep.number ? 'bg-white/10 text-white' : 'text-white/70'
                        }`}
                      >
                        Серия {ep.number}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Dubbing selector */}
              {dubbings.length > 1 && (
                <div className="relative" data-dropdown>
                  <button
                    onClick={() => setShowDubbingDropdown(!showDubbingDropdown)}
                    className="flex items-center gap-1 text-sm px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <span>{currentDubbing}</span>
                    <ChevronDown size={12} className={`transition-transform ${showDubbingDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showDubbingDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full mt-1 left-0 bg-[#1a1a1b] border border-white/20 rounded-lg shadow-xl z-50 min-w-[150px] max-h-64 overflow-y-auto"
                    >
                      {dubbings.map((dub) => (
                        <button
                          key={dub}
                          onClick={() => { setDubbing(dub); setShowDubbingDropdown(false) }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                            currentDubbing === dub ? 'bg-white/10 text-white' : 'text-white/70'
                          }`}
                        >
                          {dub}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={closePlayer}
              className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
            >
              <X size={14} className="text-white" />
            </button>
          </div>

          {/* Video (iframe) */}
          <div className="flex-1 flex items-center justify-center px-4 py-3 min-h-0">
            <div className="w-full max-w-5xl aspect-video rounded-xl overflow-hidden bg-black">
              {iframeSrc ? (
                <iframe
                  key={iframeSrc}
                  src={iframeSrc}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay; fullscreen"
                  frameBorder="0"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white/30 text-sm">
                  Нет доступного видео
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
