'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import { useAniPlayerStore } from '@/store/aniPlayerStore'
import { useEffect, useMemo, useState, useCallback } from 'react'

export default function AniPlayerModal() {
  const {
    isOpen, videos, titleName, sources, activeSource,
    currentSeason, currentDubbing, currentEpisode,
    closePlayer, setSeason, setDubbing, setEpisode, setActiveSource,
  } = useAniPlayerStore()

  const [iframeError, setIframeError] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(true)
  const [iframeLoadTimeout, setIframeLoadTimeout] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)

  // Get active source
  const activeSourceData = useMemo(() => {
    return sources.find(s => s.id === activeSource)
  }, [sources, activeSource])

  // Get episodes from active source
  const sourceEpisodes = useMemo(() => {
    if (activeSourceData) {
      return activeSourceData.episodes
    }
    // Fallback to Yani videos
    return videos
      .filter((v) => (v.season ?? 1) === currentSeason && v.data.dubbing === currentDubbing)
      .sort((a, b) => Number(a.number) - Number(b.number))
  }, [activeSourceData, videos, currentSeason, currentDubbing])

  // Get unique episode numbers
  const episodeNumbers = useMemo(() => {
    if (activeSourceData) {
      return activeSourceData.episodes.map(e => e.number)
    }
    const seen = new Set<string>()
    const result: string[] = []
    for (const v of sourceEpisodes) {
      if (!seen.has(v.number)) {
        seen.add(v.number)
        result.push(v.number)
      }
    }
    return result
  }, [activeSourceData, sourceEpisodes])

  // Get iframe/HLS URL
  const iframeSrc = useMemo(() => {
    if (activeSourceData) {
      const ep = activeSourceData.episodes.find(e => e.number === currentEpisode)
      return ep?.iframeUrl || ep?.hlsUrl || null
    }
    // Fallback to Yani
    const video = videos.find(
      (v) => v.data.dubbing === currentDubbing && v.number === currentEpisode
    )
    if (!video?.iframe_url) return null
    const url = video.iframe_url
    return url.startsWith('//') ? `https:${url}` : url
  }, [activeSourceData, videos, currentEpisode, currentDubbing])

  // Reset iframe state when source/episode changes
  useEffect(() => {
    setIframeError(false)
    setIframeLoading(true)
    setIframeLoadTimeout(false)
    setIframeKey((prev) => prev + 1)
  }, [activeSource, currentEpisode])

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

              {/* Server selector */}
              {sources.length > 0 && (
                <select
                  value={activeSource}
                  onChange={(e) => setActiveSource(e.target.value)}
                  className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 font-semibold text-sm px-3 py-1.5 rounded-lg border border-indigo-500/30 hover:border-indigo-500/50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  {sources.map((source) => (
                    <option key={source.id} value={source.id} className="bg-[#1a1a1b]">
                      {source.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Season selector */}
              {currentSeason > 1 && (
                <select
                  value={currentSeason}
                  onChange={(e) => setSeason(Number(e.target.value))}
                  className="bg-white/10 text-white text-sm px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/20 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <option value={1} className="bg-[#1a1a1b]">Сезон 1</option>
                  <option value={2} className="bg-[#1a1a1b]">Сезон 2</option>
                </select>
              )}

              {/* Episode selector */}
              <select
                value={currentEpisode}
                onChange={(e) => setEpisode(e.target.value)}
                className="bg-white/10 text-white text-sm px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/20 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                {episodeNumbers.map((ep) => (
                  <option key={ep} value={ep} className="bg-[#1a1a1b]">
                    Серия {ep}
                  </option>
                ))}
              </select>

              {/* Dubbing selector */}
              {activeSourceData && activeSourceData.translations.length > 1 && (
                <select
                  value={currentDubbing}
                  onChange={(e) => setDubbing(e.target.value)}
                  className="bg-white/10 text-white text-sm px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/20 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  {activeSourceData.translations.map((dub) => (
                    <option key={dub} value={dub} className="bg-[#1a1a1b]">
                      {dub}
                    </option>
                  ))}
                </select>
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
                  <p className="text-white/30 text-xs">{activeSourceData?.name || 'Yummy'}</p>
                </div>
              )}

              {/* Timeout error */}
              {iframeLoadTimeout && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#1a1a1b] p-6 text-center">
                  <AlertTriangle className="w-12 h-12 text-yellow-400" />
                  <p className="text-white/80 font-medium mb-1">Превышено время ожидания</p>
                  <p className="text-white/40 text-sm mb-4">Попробуйте другой сервер</p>
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
                  <p className="text-white/80 font-medium mb-1">Ошибка загрузки</p>
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
