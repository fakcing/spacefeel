'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, AlertTriangle, Loader2 } from 'lucide-react'
import { useAniPlayerStore } from '@/store/aniPlayerStore'
import { useEffect, useMemo, useState, useCallback } from 'react'

const SERVER_DEFS = [
  { id: 'yummy',  label: 'YummyAnime' },
  { id: 'libria', label: 'AniLibria' },
  { id: 'vost',   label: 'AnimeVost' },
]

export default function AniPlayerModal() {
  const {
    isOpen, videos, titleName, sources, sourcesLoading, activeSource,
    currentSeason, currentDubbing, currentEpisode,
    closePlayer, setSeason, setDubbing, setEpisode, setActiveSource,
  } = useAniPlayerStore()

  const [iframeError, setIframeError] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(true)
  const [iframeLoadTimeout, setIframeLoadTimeout] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)

  const isYummyActive = activeSource === 'yummy'
  const activeSourceData = useMemo(
    () => sources.find(s => s.id === activeSource),
    [sources, activeSource]
  )

  // Episodes for the current source
  const sourceEpisodes = useMemo(() => {
    if (!isYummyActive && activeSourceData) {
      return activeSourceData.episodes
    }
    return videos
      .filter(v => (v.season ?? 1) === currentSeason && v.data.dubbing === currentDubbing)
      .sort((a, b) => Number(a.number) - Number(b.number))
  }, [isYummyActive, activeSourceData, videos, currentSeason, currentDubbing])

  // Unique episode numbers
  const episodeNumbers = useMemo(() => {
    if (!isYummyActive && activeSourceData) {
      return activeSourceData.episodes.map(e => e.number)
    }
    const seen = new Set<string>()
    const result: string[] = []
    for (const v of sourceEpisodes) {
      if (!seen.has(v.number)) { seen.add(v.number); result.push(v.number) }
    }
    return result
  }, [isYummyActive, activeSourceData, sourceEpisodes])

  // Guard: if currentEpisode is not in available list, snap to first
  const safeEpisode = useMemo(() => {
    if (episodeNumbers.length === 0) return currentEpisode
    return episodeNumbers.includes(currentEpisode) ? currentEpisode : episodeNumbers[0]
  }, [episodeNumbers, currentEpisode])

  // Dubbings for Yummy
  const yummyDubbings = useMemo(() => {
    const seasonVideos = videos.filter(v => (v.season ?? 1) === currentSeason)
    return Array.from(new Set(seasonVideos.map(v => v.data.dubbing)))
  }, [videos, currentSeason])

  // Unique seasons for Yummy
  const yummySeasons = useMemo(
    () => Array.from(new Set(videos.map(v => v.season ?? 1))).sort((a, b) => a - b),
    [videos]
  )

  // Iframe URL
  const iframeSrc = useMemo(() => {
    if (!isYummyActive && activeSourceData) {
      const ep = activeSourceData.episodes.find(e => e.number === safeEpisode)
      return ep?.iframeUrl || ep?.hlsUrl || null
    }
    const video = videos.find(
      v => v.data.dubbing === currentDubbing
        && v.number === safeEpisode
        && (v.season ?? 1) === currentSeason
    )
    if (!video?.iframe_url) return null
    const url = video.iframe_url
    return url.startsWith('//') ? `https:${url}` : url
  }, [isYummyActive, activeSourceData, videos, safeEpisode, currentDubbing, currentSeason])

  // Reset iframe on source/episode change
  useEffect(() => {
    setIframeError(false)
    setIframeLoading(true)
    setIframeLoadTimeout(false)
    setIframeKey(p => p + 1)
  }, [activeSource, safeEpisode])

  const handleIframeLoad = useCallback(() => {
    setIframeLoading(false)
    setIframeLoadTimeout(false)
  }, [])

  const handleIframeError = useCallback(() => {
    setIframeLoading(false)
    setIframeError(true)
  }, [])

  // 15s timeout
  useEffect(() => {
    if (!iframeLoading) return
    const timer = setTimeout(() => setIframeLoadTimeout(true), 15000)
    return () => clearTimeout(timer)
  }, [iframeLoading, iframeKey])

  // Navigation
  const epIndex = episodeNumbers.indexOf(safeEpisode)
  const prevEp = epIndex > 0 ? episodeNumbers[epIndex - 1] : null
  const nextEp = epIndex < episodeNumbers.length - 1 ? episodeNumbers[epIndex + 1] : null

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePlayer()
      if (e.key === 'ArrowLeft' && prevEp) setEpisode(prevEp)
      if (e.key === 'ArrowRight' && nextEp) setEpisode(nextEp)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, closePlayer, prevEp, nextEp, setEpisode])

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
          {/* ── Header ── */}
          <div className="flex items-center gap-2 px-3 py-2.5 flex-shrink-0 border-b border-white/10 flex-wrap sm:flex-nowrap">

            {/* Prev / Next */}
            <button
              onClick={() => prevEp && setEpisode(prevEp)}
              disabled={!prevEp}
              className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/10 disabled:opacity-20 transition-colors flex-shrink-0"
              aria-label="Предыдущая серия"
            >
              <ChevronLeft size={15} className="text-white" />
            </button>
            <button
              onClick={() => nextEp && setEpisode(nextEp)}
              disabled={!nextEp}
              className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/10 disabled:opacity-20 transition-colors flex-shrink-0"
              aria-label="Следующая серия"
            >
              <ChevronRight size={15} className="text-white" />
            </button>

            {/* Title */}
            <span className="text-white/70 text-sm font-medium truncate max-w-[130px] sm:max-w-[200px] flex-shrink-0">
              {titleName}
            </span>

            {/* Controls */}
            <div className="flex items-center gap-1.5 flex-1 flex-wrap min-w-0">

              {/* Server tabs */}
              <div className="flex items-center gap-0.5 p-0.5 rounded-xl border border-white/10 bg-white/5">
                {SERVER_DEFS.map(srv => {
                  const isActive = activeSource === srv.id
                  const srcData = sources.find(s => s.id === srv.id)
                  const isAvailable = srv.id === 'yummy'
                    ? videos.length > 0
                    : srcData !== undefined && srcData.available
                  const isPending = sourcesLoading && srv.id !== 'yummy' && !srcData

                  return (
                    <button
                      key={srv.id}
                      onClick={() => isAvailable ? setActiveSource(srv.id) : undefined}
                      disabled={!isAvailable && !isPending}
                      title={isPending ? 'Загрузка...' : !isAvailable ? 'Недоступно' : srv.label}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-white text-black shadow'
                          : isAvailable
                          ? 'text-white/70 hover:text-white hover:bg-white/10'
                          : 'text-white/25 cursor-not-allowed'
                      }`}
                    >
                      {isPending && <Loader2 size={9} className="animate-spin shrink-0" />}
                      {srv.label}
                    </button>
                  )
                })}
              </div>

              {/* Season (Yummy, multi-season) */}
              {isYummyActive && yummySeasons.length > 1 && (
                <select
                  value={currentSeason}
                  onChange={e => setSeason(Number(e.target.value))}
                  className="bg-white/5 border border-white/10 text-white text-xs px-2 py-1.5 rounded-lg cursor-pointer focus:outline-none"
                >
                  {yummySeasons.map(s => (
                    <option key={s} value={s} className="bg-black">Сезон {s}</option>
                  ))}
                </select>
              )}

              {/* Episode */}
              {episodeNumbers.length > 0 && (
                <select
                  value={safeEpisode}
                  onChange={e => setEpisode(e.target.value)}
                  className="bg-white/5 border border-white/10 text-white text-xs px-2 py-1.5 rounded-lg cursor-pointer focus:outline-none"
                >
                  {episodeNumbers.map(ep => (
                    <option key={ep} value={ep} className="bg-black">Серия {ep}</option>
                  ))}
                </select>
              )}

              {/* Dubbing (only when multiple) */}
              {isYummyActive && yummyDubbings.length > 1 && (
                <select
                  value={currentDubbing}
                  onChange={e => setDubbing(e.target.value)}
                  className="bg-white/5 border border-white/10 text-white text-xs px-2 py-1.5 rounded-lg cursor-pointer focus:outline-none max-w-[130px]"
                >
                  {yummyDubbings.map(dub => (
                    <option key={dub} value={dub} className="bg-black">{dub}</option>
                  ))}
                </select>
              )}
              {!isYummyActive && activeSourceData && activeSourceData.translations.length > 1 && (
                <select
                  value={currentDubbing}
                  onChange={e => setDubbing(e.target.value)}
                  className="bg-white/5 border border-white/10 text-white text-xs px-2 py-1.5 rounded-lg cursor-pointer focus:outline-none max-w-[130px]"
                >
                  {activeSourceData.translations.map(dub => (
                    <option key={dub} value={dub} className="bg-black">{dub}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Close */}
            <button
              onClick={closePlayer}
              className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0 ml-auto"
              aria-label="Закрыть"
            >
              <X size={14} className="text-white" />
            </button>
          </div>

          {/* ── Video ── */}
          <div className="flex-1 flex items-center justify-center px-2 sm:px-4 py-3 min-h-0">
            <div className="w-full max-w-5xl aspect-video rounded-xl overflow-hidden bg-black relative">

              {/* Loading */}
              {iframeLoading && !iframeLoadTimeout && iframeSrc && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0a0a0a]">
                  <div className="w-9 h-9 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                  <p className="text-white/40 text-sm">Загрузка плеера...</p>
                </div>
              )}

              {/* Timeout */}
              {iframeLoadTimeout && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0a0a0a] p-6 text-center">
                  <AlertTriangle className="w-10 h-10 text-white/30" />
                  <p className="text-white/70 font-medium text-sm">Превышено время ожидания</p>
                  <p className="text-white/30 text-xs mb-2">Попробуйте другой сервер</p>
                  <button
                    onClick={() => { setIframeLoadTimeout(false); setIframeLoading(true); setIframeKey(p => p + 1) }}
                    className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
                  >
                    Повторить
                  </button>
                </div>
              )}

              {/* Error */}
              {iframeError && !iframeLoadTimeout && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0a0a0a] p-6 text-center">
                  <AlertTriangle className="w-10 h-10 text-white/30" />
                  <p className="text-white/70 font-medium text-sm">Ошибка загрузки</p>
                  <button
                    onClick={() => { setIframeError(false); setIframeLoading(true); setIframeKey(p => p + 1) }}
                    className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
                  >
                    Повторить
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
                  title={`${titleName} — Серия ${safeEpisode}`}
                />
              )}

              {/* No video */}
              {!iframeSrc && !iframeLoading && !iframeError && !iframeLoadTimeout && (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-white/30 text-sm">
                  <p>Нет доступного видео</p>
                  {!isYummyActive && videos.length > 0 && (
                    <button
                      onClick={() => setActiveSource('yummy')}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white/50 text-xs hover:bg-white/15 transition-colors"
                    >
                      Попробовать YummyAnime
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
