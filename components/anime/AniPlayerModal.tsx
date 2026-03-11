'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ChevronDown, AlertTriangle } from 'lucide-react'
import { useAniPlayerStore } from '@/store/aniPlayerStore'
import { useEffect, useMemo, useState, useCallback } from 'react'

export default function AniPlayerModal() {
  const {
    isOpen, videos, titleName,
    currentSeason, currentDubbing, currentEpisode,
    closePlayer, setSeason, setDubbing, setEpisode,
  } = useAniPlayerStore()

  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false)
  const [showEpisodeDropdown, setShowEpisodeDropdown] = useState(false)
  const [showDubbingDropdown, setShowDubbingDropdown] = useState(false)
  const [iframeError, setIframeError] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(true)
  const [iframeLoadTimeout, setIframeLoadTimeout] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)

  // Get unique seasons sorted
  const seasons = useMemo(
    () => Array.from(new Set(videos.map((v) => v.season ?? 1))).sort((a, b) => a - b),
    [videos]
  )

  // Videos for selected season
  const seasonVideos = useMemo(
    () => videos.filter((v) => (v.season ?? 1) === currentSeason),
    [videos, currentSeason]
  )

  // Unique dubbings for selected season (in order of appearance)
  const dubbings = useMemo(
    () => {
      const seen = new Set<string>()
      const result: string[] = []
      for (const v of seasonVideos) {
        if (!seen.has(v.data.dubbing)) {
          seen.add(v.data.dubbing)
          result.push(v.data.dubbing)
        }
      }
      return result
    },
    [seasonVideos]
  )

  // Unique episodes for selected season and dubbing (no duplicates)
  const episodeNumbers = useMemo(() => {
    const dubVideos = seasonVideos.filter((v) => v.data.dubbing === currentDubbing)
    const seen = new Set<string>()
    const result: string[] = []
    for (const v of dubVideos) {
      if (!seen.has(v.number)) {
        seen.add(v.number)
        result.push(v.number)
      }
    }
    return result.sort((a, b) => Number(a) - Number(b))
  }, [seasonVideos, currentDubbing])

  // Get current video iframe URL
  const iframeSrc = useMemo(() => {
    const video = seasonVideos.find(
      (v) => v.data.dubbing === currentDubbing && v.number === currentEpisode
    )
    if (!video?.iframe_url) return null
    const url = video.iframe_url
    return url.startsWith('//') ? `https:${url}` : url
  }, [seasonVideos, currentDubbing, currentEpisode])

  // Reset iframe state when video changes
  useEffect(() => {
    setIframeError(false)
    setIframeLoading(true)
    setIframeLoadTimeout(false)
    setIframeKey((prev) => prev + 1)
  }, [iframeSrc])

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    setIframeLoading(false)
    setIframeLoadTimeout(false)
  }, [])

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    setIframeLoading(false)
    setIframeError(true)
  }, [])

  // Timeout for iframe loading (15 seconds)
  useEffect(() => {
    if (!iframeLoading) return

    const timeout = setTimeout(() => {
      setIframeLoadTimeout(true)
    }, 15000)

    return () => clearTimeout(timeout)
  }, [iframeLoading])

  // Navigation helpers
  const currentEpisodeIndex = episodeNumbers.indexOf(currentEpisode)
  const prevEp = currentEpisodeIndex > 0 ? episodeNumbers[currentEpisodeIndex - 1] : null
  const nextEp = currentEpisodeIndex < episodeNumbers.length - 1 ? episodeNumbers[currentEpisodeIndex + 1] : null

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePlayer()
      if (e.key === 'ArrowLeft' && prevEp) setEpisode(prevEp)
      if (e.key === 'ArrowRight' && nextEp) setEpisode(nextEp)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closePlayer, prevEp, nextEp, setEpisode])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest('[data-dropdown]')) {
        setShowSeasonDropdown(false)
        setShowEpisodeDropdown(false)
        setShowDubbingDropdown(false)
      }
    }
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [])

  if (!isOpen) return null

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
              onClick={() => prevEp && setEpisode(prevEp)}
              disabled={!prevEp}
              className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 disabled:opacity-25 transition-colors flex-shrink-0"
            >
              <ChevronLeft size={16} className="text-white" />
            </button>
            <button
              onClick={() => nextEp && setEpisode(nextEp)}
              disabled={!nextEp}
              className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 disabled:opacity-25 transition-colors flex-shrink-0"
            >
              <ChevronRight size={16} className="text-white" />
            </button>

            <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
              <span className="text-white font-semibold text-sm truncate">{titleName}</span>
              <span className="text-white/40 text-sm">·</span>

              {/* Season selector */}
              {seasons.length > 1 && (
                <div className="relative" data-dropdown>
                  <button
                    onClick={() => setShowSeasonDropdown(!showSeasonDropdown)}
                    className="flex items-center gap-1 text-sm px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <span>Сезон {currentSeason}</span>
                    <ChevronDown size={12} className={`transition-transform ${showSeasonDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showSeasonDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full mt-1 left-0 bg-[#1a1a1b] border border-white/20 rounded-lg shadow-xl z-50 min-w-[100px] max-h-64 overflow-y-auto"
                    >
                      {seasons.map((s) => (
                        <button
                          key={s}
                          onClick={() => { setSeason(s); setShowSeasonDropdown(false) }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                            currentSeason === s ? 'bg-white/10 text-white' : 'text-white/70'
                          }`}
                        >
                          Сезон {s}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}

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
                    {episodeNumbers.map((ep) => (
                      <button
                        key={ep}
                        onClick={() => { setEpisode(ep); setShowEpisodeDropdown(false) }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                          currentEpisode === ep ? 'bg-white/10 text-white' : 'text-white/70'
                        }`}
                      >
                        Серия {ep}
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

          {/* Video container */}
          <div className="flex-1 flex items-center justify-center px-2 sm:px-4 py-3 min-h-0">
            <div className="w-full max-w-5xl aspect-video rounded-lg sm:rounded-xl overflow-hidden bg-black relative">
              {/* Loading state */}
              {iframeLoading && !iframeLoadTimeout && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1a1a1b]">
                  <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  <p className="text-white/40 text-sm">Загрузка плеера...</p>
                </div>
              )}

              {/* Timeout error */}
              {iframeLoadTimeout && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#1a1a1b] p-6 text-center">
                  <AlertTriangle className="w-12 h-12 text-yellow-400" />
                  <p className="text-white/80 font-medium mb-1">Превышено время ожидания</p>
                  <p className="text-white/40 text-sm mb-4">
                    Попробуйте сменить озвучку или загрузить снова
                  </p>
                  <button
                    onClick={() => {
                      setIframeLoadTimeout(false)
                      setIframeLoading(true)
                      setIframeKey((prev) => prev + 1)
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
                  >
                    Попробовать снова
                  </button>
                </div>
              )}

              {/* Load error */}
              {iframeError && !iframeLoadTimeout && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#1a1a1b] p-6 text-center">
                  <AlertTriangle className="w-12 h-12 text-red-400" />
                  <p className="text-white/80 font-medium mb-1">Ошибка загрузки видео</p>
                  <button
                    onClick={() => {
                      setIframeError(false)
                      setIframeLoading(true)
                      setIframeKey((prev) => prev + 1)
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
                  >
                    Попробовать снова
                  </button>
                </div>
              )}

              {/* Iframe */}
              {iframeSrc && !iframeError && !iframeLoadTimeout && (
                <iframe
                  key={iframeKey}
                  src={iframeSrc}
                  className="w-full h-full"
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  allowFullScreen
                  allow="autoplay; fullscreen; picture-in-picture"
                  frameBorder="0"
                  title={`${titleName} - Серия ${currentEpisode}`}
                />
              )}

              {/* No video available */}
              {!iframeSrc && !iframeLoading && !iframeError && !iframeLoadTimeout && (
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
