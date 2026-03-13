'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, ChevronDown } from 'lucide-react'
import { useAniPlayerStore } from '@/store/aniPlayerStore'
import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import HlsPlayer from '@/components/anime/HlsPlayer'

const SERVER_DEFS = [
  { id: 'yummy',  label: 'YummyAnime' },
  { id: 'libria', label: 'AniLibria' },
  { id: 'vost',   label: 'AnimeVost' },
]

type VideoSrc = { type: 'iframe'; url: string } | { type: 'hls'; url: string } | null

export default function AniPlayerModal() {
  const {
    isOpen, videos, titleName, sources, sourcesLoading, activeSource,
    currentSeason, currentDubbing, currentEpisode,
    closePlayer, setSeason, setDubbing, setEpisode, setActiveSource,
  } = useAniPlayerStore()

  const [playerError, setPlayerError] = useState(false)
  const [playerLoading, setPlayerLoading] = useState(true)
  const [loadTimeout, setLoadTimeout] = useState(false)
  const [playerKey, setPlayerKey] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [epPickerOpen, setEpPickerOpen] = useState(false)
  const [dubPickerOpen, setDubPickerOpen] = useState(false)
  const epPickerRef = useRef<HTMLDivElement>(null)
  const dubPickerRef = useRef<HTMLDivElement>(null)
  const activeEpRef = useRef<HTMLButtonElement>(null)

  const isYummyActive = activeSource === 'yummy'
  const activeSourceData = useMemo(
    () => sources.find(s => s.id === activeSource),
    [sources, activeSource]
  )

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Episodes for the current source
  const sourceEpisodes = useMemo(() => {
    if (!isYummyActive && activeSourceData) return activeSourceData.episodes
    return videos
      .filter(v => (v.season ?? 1) === currentSeason && v.data.dubbing === currentDubbing)
      .sort((a, b) => Number(a.number) - Number(b.number))
  }, [isYummyActive, activeSourceData, videos, currentSeason, currentDubbing])

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

  const safeEpisode = useMemo(() => {
    if (episodeNumbers.length === 0) return currentEpisode
    return episodeNumbers.includes(currentEpisode) ? currentEpisode : episodeNumbers[0]
  }, [episodeNumbers, currentEpisode])

  const yummyDubbings = useMemo(() => {
    const seasonVideos = videos.filter(v => (v.season ?? 1) === currentSeason)
    return Array.from(new Set(seasonVideos.map(v => v.data.dubbing)))
  }, [videos, currentSeason])

  const yummySeasons = useMemo(
    () => Array.from(new Set(videos.map(v => v.season ?? 1))).sort((a, b) => a - b),
    [videos]
  )

  // Video source — iframe or HLS
  const videoSrc = useMemo((): VideoSrc => {
    if (!isYummyActive && activeSourceData) {
      const ep = activeSourceData.episodes.find(e => e.number === safeEpisode)
      if (!ep) return null
      if (ep.iframeUrl) return { type: 'iframe', url: ep.iframeUrl }
      if (ep.hlsUrl)    return { type: 'hls',    url: ep.hlsUrl }
      return null
    }
    const video = videos.find(
      v => v.data.dubbing === currentDubbing
        && v.number === safeEpisode
        && (v.season ?? 1) === currentSeason
    )
    if (!video?.iframe_url) return null
    const url = video.iframe_url
    return { type: 'iframe', url: url.startsWith('//') ? `https:${url}` : url }
  }, [isYummyActive, activeSourceData, videos, safeEpisode, currentDubbing, currentSeason])

  // Reset player on source/episode change
  useEffect(() => {
    setPlayerError(false)
    setPlayerLoading(true)
    setLoadTimeout(false)
    setIsPaused(false)
    setPlayerKey(p => p + 1)
  }, [activeSource, safeEpisode])

  // 15s timeout for iframe
  useEffect(() => {
    if (!playerLoading || videoSrc?.type !== 'iframe') return
    const timer = setTimeout(() => setLoadTimeout(true), 15000)
    return () => clearTimeout(timer)
  }, [playerLoading, playerKey, videoSrc?.type])

  const handleLoad = useCallback(() => {
    setPlayerLoading(false)
    setLoadTimeout(false)
  }, [])

  const handleError = useCallback(() => {
    setPlayerLoading(false)
    setPlayerError(true)
  }, [])

  const retry = () => {
    setPlayerError(false)
    setPlayerLoading(true)
    setLoadTimeout(false)
    setPlayerKey(p => p + 1)
  }

  // Episode picker close-on-outside-click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (epPickerRef.current && !epPickerRef.current.contains(e.target as Node)) {
        setEpPickerOpen(false)
      }
    }
    if (epPickerOpen) {
      document.addEventListener('mousedown', handleClick)
      setTimeout(() => activeEpRef.current?.scrollIntoView({ block: 'nearest' }), 10)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [epPickerOpen])

  // Dub picker close-on-outside-click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dubPickerRef.current && !dubPickerRef.current.contains(e.target as Node)) {
        setDubPickerOpen(false)
      }
    }
    if (dubPickerOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dubPickerOpen])

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

  const activeDubbings = isYummyActive
    ? yummyDubbings
    : (activeSourceData?.translations ?? [])

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
          <div className="flex items-center gap-2 px-3 py-2.5 flex-shrink-0 border-b border-white/10 flex-wrap sm:flex-nowrap overflow-visible">

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
                  const isYummy = srv.id === 'yummy'
                  const canPlay = isYummy
                    ? videos.length > 0
                    : !sourcesLoading && srcData?.available
                  const isPending = sourcesLoading && !isYummy

                  return (
                    <button
                      key={srv.id}
                      onClick={() => setActiveSource(srv.id)}
                      disabled={isYummy && videos.length === 0}
                      title={srv.label}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-white text-black shadow'
                          : canPlay
                          ? 'text-white/70 hover:text-white hover:bg-white/10'
                          : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                      }`}
                    >
                      {isPending && !isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      )}
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

              {/* Episode picker popover */}
              {episodeNumbers.length > 0 && (
                <div className="relative" ref={epPickerRef}>
                  <button
                    onClick={e => { e.stopPropagation(); setEpPickerOpen(p => !p) }}
                    className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-medium hover:bg-white/10 transition-colors"
                  >
                    <span className="text-white/50">Серия</span>
                    <span className="text-white">{safeEpisode}</span>
                    <ChevronDown size={10} className="text-white/40" />
                  </button>

                  {epPickerOpen && (
                    <div className="absolute top-full left-0 mt-1.5 bg-[#111] border border-white/10 rounded-xl p-2 z-[200] shadow-2xl min-w-[200px]">
                      <p className="text-white/30 text-[10px] font-medium uppercase tracking-wide px-1 pb-1.5">
                        Серии · {episodeNumbers.length} эп.
                      </p>
                      <div className="grid grid-cols-5 gap-1 max-h-52 overflow-y-auto">
                        {episodeNumbers.map(ep => (
                          <button
                            key={ep}
                            ref={safeEpisode === ep ? activeEpRef : undefined}
                            onClick={() => { setEpisode(ep); setEpPickerOpen(false) }}
                            className={`h-8 rounded-lg text-xs font-medium transition-all ${
                              safeEpisode === ep
                                ? 'bg-white text-black'
                                : 'text-white/60 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {ep}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dubbing picker popover */}
              {activeDubbings.length > 1 && (
                <div className="relative" ref={dubPickerRef}>
                  <button
                    onClick={e => { e.stopPropagation(); setDubPickerOpen(p => !p) }}
                    className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-medium hover:bg-white/10 transition-colors max-w-[140px] min-w-0 overflow-hidden"
                  >
                    <span className="text-white/50 flex-shrink-0 text-[10px]">Дуб</span>
                    <span className="text-white truncate min-w-0">{currentDubbing || '—'}</span>
                    <ChevronDown size={10} className="text-white/40 flex-shrink-0 ml-0.5" />
                  </button>

                  {dubPickerOpen && (
                    <div className="absolute top-full left-0 mt-1.5 bg-[#111] border border-white/10 rounded-xl p-2 z-[200] shadow-2xl min-w-[160px] max-w-[260px]">
                      <p className="text-white/30 text-[10px] font-medium uppercase tracking-wide px-1 pb-1.5">
                        Озвучка · {activeDubbings.length}
                      </p>
                      <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
                        {activeDubbings.map(dub => (
                          <button
                            key={dub}
                            onClick={() => { setDubbing(dub); setDubPickerOpen(false) }}
                            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium transition-all truncate ${
                              currentDubbing === dub
                                ? 'bg-white text-black'
                                : 'text-white/60 hover:bg-white/10 hover:text-white'
                            }`}
                            title={dub}
                          >
                            {dub}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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

              {/* Sources still fetching for this server */}
              {!isYummyActive && sourcesLoading && !activeSourceData && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0a0a0a] z-10">
                  <div className="w-9 h-9 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                  <p className="text-white/40 text-sm">Поиск видео на сервере...</p>
                </div>
              )}

              {/* Source loaded but unavailable */}
              {!isYummyActive && !sourcesLoading && (!activeSourceData || !activeSourceData.available) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0a0a0a] z-10">
                  <AlertTriangle className="w-10 h-10 text-white/30" />
                  <p className="text-white/70 font-medium text-sm">Аниме не найдено на этом сервере</p>
                  <button
                    onClick={() => setActiveSource('yummy')}
                    className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
                  >
                    Вернуться на YummyAnime
                  </button>
                </div>
              )}

              {/* Loading */}
              {playerLoading && !loadTimeout && videoSrc && (isYummyActive || (activeSourceData?.available)) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0a0a0a] z-10">
                  <div className="w-9 h-9 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                  <p className="text-white/40 text-sm">Загрузка плеера...</p>
                </div>
              )}

              {/* Timeout */}
              {loadTimeout && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0a0a0a] p-6 text-center z-10">
                  <AlertTriangle className="w-10 h-10 text-white/30" />
                  <p className="text-white/70 font-medium text-sm">Превышено время ожидания</p>
                  <p className="text-white/30 text-xs mb-2">Попробуйте другой сервер</p>
                  <button onClick={retry} className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors">
                    Повторить
                  </button>
                </div>
              )}

              {/* Error */}
              {playerError && !loadTimeout && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0a0a0a] p-6 text-center z-10">
                  <AlertTriangle className="w-10 h-10 text-white/30" />
                  <p className="text-white/70 font-medium text-sm">Ошибка загрузки</p>
                  <button onClick={retry} className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors">
                    Повторить
                  </button>
                </div>
              )}

              {/* HLS Player (with grayscale-on-pause) */}
              {videoSrc?.type === 'hls' && !playerError && !loadTimeout && (
                <div
                  className="w-full h-full transition-[filter] duration-700"
                  style={{ filter: isPaused ? 'grayscale(1)' : 'grayscale(0)' }}
                >
                  <HlsPlayer
                    key={playerKey}
                    src={videoSrc.url}
                    playerKey={playerKey}
                    onLoad={handleLoad}
                    onError={handleError}
                    onPause={() => setIsPaused(true)}
                    onPlay={() => setIsPaused(false)}
                  />
                </div>
              )}

              {/* Iframe Player */}
              {videoSrc?.type === 'iframe' && !playerError && !loadTimeout && (
                <iframe
                  key={playerKey}
                  src={videoSrc.url}
                  className="w-full h-full"
                  onLoad={handleLoad}
                  onError={handleError}
                  allowFullScreen
                  allow="autoplay; fullscreen; picture-in-picture"
                  frameBorder="0"
                  title={`${titleName} — Серия ${safeEpisode}`}
                />
              )}

              {/* No video */}
              {!videoSrc && !playerLoading && !playerError && !loadTimeout && (
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
