'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, ChevronDown, RefreshCw } from 'lucide-react'
import { useMediaPlayerStore } from '@/store/mediaPlayerStore'
import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'

interface PlayerServer {
  name: string
  iframe: string
  source: string
  seasonKey?: string
  episodeKey?: string
}

export default function MediaPlayerModal() {
  const {
    isOpen,
    mediaType,
    item,
    tmdbId,
    season: storeSeason,
    episode: storeEpisode,
    closePlayer,
    setSeason: setStoreSeason,
    setEpisode: setStoreEpisode,
  } = useMediaPlayerStore()

  const [servers, setServers] = useState<PlayerServer[]>([])
  const [activeServer, setActiveServer] = useState(0)
  const [serversLoading, setServersLoading] = useState(true)
  const [selectedSeason, setSelectedSeason] = useState(storeSeason)
  const [selectedEpisode, setSelectedEpisode] = useState(storeEpisode)
  const [iframeKey, setIframeKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [loadTimeout, setLoadTimeout] = useState(false)
  const [seasonPickerOpen, setSeasonPickerOpen] = useState(false)
  const [epPickerOpen, setEpPickerOpen] = useState(false)
  const seasonPickerRef = useRef<HTMLDivElement>(null)
  const epPickerRef = useRef<HTMLDivElement>(null)

  const t = useTranslations('player')
  const isTV = mediaType === 'tv'

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

  // Fetch servers
  useEffect(() => {
    if (!isOpen || !tmdbId) return
    const apiType = mediaType === 'cartoon' ? 'movie' : mediaType === 'anime' ? 'tv' : mediaType
    setServersLoading(true)
    setServers([])
    setActiveServer(0)
    fetch(`/api/player/${tmdbId}?type=${apiType}`)
      .then(r => r.json())
      .then(data => {
        if (data.servers && data.servers.length > 0) {
          setServers(data.servers)
          setActiveServer(0)
        }
      })
      .catch(() => {})
      .finally(() => setServersLoading(false))
  }, [isOpen, tmdbId, mediaType])

  // Sync season/episode from store on open
  useEffect(() => { setSelectedSeason(storeSeason) }, [storeSeason])
  useEffect(() => { setSelectedEpisode(storeEpisode) }, [storeEpisode])

  const recordHistory = useCallback((season: number, episode: number) => {
    if (!tmdbId || !isTV) return
    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tmdbId,
        mediaType: 'tv',
        posterPath: item && !('title' in item) ? item.poster_path : null,
        season,
        episode,
      }),
    })
  }, [tmdbId, isTV, item])

  const setSeason = (s: number) => {
    setSelectedSeason(s)
    setStoreSeason(s)
  }

  const setEpisode = (e: number) => {
    setSelectedEpisode(e)
    setStoreEpisode(e)
    recordHistory(selectedSeason, e)
  }

  const iframeSrc = useMemo(() => {
    if (servers.length === 0) return null
    const server = servers[activeServer]
    if (!server) return null
    let url = server.iframe
    if (url.includes('{season}') || url.includes('{episode}')) {
      url = url
        .replace('{season}', String(selectedSeason))
        .replace('{episode}', String(selectedEpisode))
    } else if (isTV && selectedSeason && selectedEpisode) {
      const sep = url.includes('?') ? '&' : '?'
      const sKey = server.seasonKey ?? 'season'
      const eKey = server.episodeKey ?? 'episode'
      url += `${sep}${sKey}=${selectedSeason}&${eKey}=${selectedEpisode}`
    }
    return url
  }, [servers, activeServer, isTV, selectedSeason, selectedEpisode])

  // Reset iframe on src change
  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    setLoadTimeout(false)
    setIframeKey(p => p + 1)
  }, [iframeSrc])

  // 10s timeout
  useEffect(() => {
    if (!isLoading) return
    const timer = setTimeout(() => setLoadTimeout(true), 10000)
    return () => clearTimeout(timer)
  }, [isLoading, iframeKey])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
    setLoadTimeout(false)
  }, [])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
  }, [])

  const retry = () => {
    setIsLoading(true)
    setHasError(false)
    setLoadTimeout(false)
    setIframeKey(p => p + 1)
  }

  // Season picker close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (seasonPickerRef.current && !seasonPickerRef.current.contains(e.target as Node)) {
        setSeasonPickerOpen(false)
      }
    }
    if (seasonPickerOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [seasonPickerOpen])

  // Episode picker close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (epPickerRef.current && !epPickerRef.current.contains(e.target as Node)) {
        setEpPickerOpen(false)
      }
    }
    if (epPickerOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [epPickerOpen])

  const title = item ? ('title' in item ? item.title : item.name) : 'Media Player'
  const totalSeasons = item && !('title' in item) ? (item.number_of_seasons ?? 1) : 1
  const totalEpisodes = item && !('title' in item)
    ? (item.seasons?.find(s => s.season_number === selectedSeason)?.episode_count ?? item.number_of_episodes ?? 50)
    : 1

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
          {/* ── Desktop Header ── */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-2.5 flex-shrink-0 border-b flex-nowrap overflow-visible"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {/* Title */}
            <span
              className="text-sm font-medium truncate max-w-[200px] flex-shrink-0"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {title}
            </span>

            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              {/* Server tabs — only shown when multiple servers */}
              {servers.length > 1 && (
                <div
                  className="flex items-center gap-0.5 p-0.5 rounded-xl"
                  style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-overlay)' }}
                >
                  {servers.map((srv, idx) => (
                    <button
                      key={srv.source}
                      onClick={() => setActiveServer(idx)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                      style={
                        activeServer === idx
                          ? { backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }
                          : { color: 'var(--color-text-muted)' }
                      }
                    >
                      {srv.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Season picker (TV only) */}
              {isTV && (
                <div className="relative" ref={seasonPickerRef}>
                  <button
                    onClick={e => { e.stopPropagation(); setSeasonPickerOpen(p => !p) }}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: 'var(--color-overlay)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  >
                    <span style={{ color: 'var(--color-text-muted)' }}>{t('season')}</span>
                    <span style={{ color: 'var(--color-text)' }}>{selectedSeason}</span>
                    <ChevronDown size={10} style={{ color: 'var(--color-text-subtle)' }} />
                  </button>
                  {seasonPickerOpen && (
                    <div
                      className="absolute top-full left-0 mt-1.5 rounded-xl p-2 z-[200] shadow-2xl min-w-[160px]"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <p
                        className="text-[10px] font-medium uppercase tracking-wide px-1 pb-1.5"
                        style={{ color: 'var(--color-text-subtle)' }}
                      >
                        {t('seasons')}
                      </p>
                      <div className="grid grid-cols-4 gap-1 max-h-52 overflow-y-auto">
                        {Array.from({ length: totalSeasons }, (_, i) => i + 1).map(s => (
                          <button
                            key={s}
                            onClick={() => { setSeason(s); setSeasonPickerOpen(false) }}
                            className="h-8 rounded-lg text-xs font-medium transition-all"
                            style={
                              selectedSeason === s
                                ? { backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }
                                : { color: 'var(--color-text-muted)' }
                            }
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Episode picker (TV only) */}
              {isTV && (
                <div className="relative" ref={epPickerRef}>
                  <button
                    onClick={e => { e.stopPropagation(); setEpPickerOpen(p => !p) }}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: 'var(--color-overlay)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  >
                    <span style={{ color: 'var(--color-text-muted)' }}>{t('episode')}</span>
                    <span style={{ color: 'var(--color-text)' }}>{selectedEpisode}</span>
                    <ChevronDown size={10} style={{ color: 'var(--color-text-subtle)' }} />
                  </button>
                  {epPickerOpen && (
                    <div
                      className="absolute top-full left-0 mt-1.5 rounded-xl p-2 z-[200] shadow-2xl min-w-[200px]"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <p
                        className="text-[10px] font-medium uppercase tracking-wide px-1 pb-1.5"
                        style={{ color: 'var(--color-text-subtle)' }}
                      >
                        {t('episodes')}
                      </p>
                      <div className="grid grid-cols-5 gap-1 max-h-52 overflow-y-auto">
                        {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map(ep => (
                          <button
                            key={ep}
                            onClick={() => { setEpisode(ep); setEpPickerOpen(false) }}
                            className="h-8 rounded-lg text-xs font-medium transition-all"
                            style={
                              selectedEpisode === ep
                                ? { backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }
                                : { color: 'var(--color-text-muted)' }
                            }
                          >
                            {ep}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Movie label */}
              {!isTV && (
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t('movie')}</span>
              )}
            </div>

            {/* Close */}
            <button
              onClick={closePlayer}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ml-auto"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
              aria-label={t('close')}
            >
              <X size={14} />
            </button>
          </div>

          {/* ── Mobile Header ── */}
          <div
            className="sm:hidden flex-shrink-0"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            {/* Row 1: title + close */}
            <div className="flex items-center gap-2 px-3 pt-2.5 pb-1.5">
              <span
                className="text-sm font-medium truncate flex-1 min-w-0"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {title}
              </span>
              <button
                onClick={closePlayer}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                aria-label={t('close')}
              >
                <X size={14} />
              </button>
            </div>

            {/* Row 2: controls, horizontally scrollable */}
            <div className="flex items-center gap-1.5 px-3 pb-2.5 overflow-x-auto scrollbar-none">
              {/* Server tabs */}
              {servers.length > 1 && (
                <div
                  className="flex items-center gap-0.5 p-0.5 rounded-xl flex-shrink-0"
                  style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-overlay)' }}
                >
                  {servers.map((srv, idx) => (
                    <button
                      key={srv.source}
                      onClick={() => setActiveServer(idx)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                      style={
                        activeServer === idx
                          ? { backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }
                          : { color: 'var(--color-text-muted)' }
                      }
                    >
                      {srv.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Season select */}
              {isTV && (
                <select
                  value={selectedSeason}
                  onChange={e => setSeason(Number(e.target.value))}
                  className="text-xs px-2 py-1.5 rounded-lg cursor-pointer focus:outline-none flex-shrink-0"
                  style={{
                    backgroundColor: 'var(--color-overlay)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  {Array.from({ length: totalSeasons }, (_, i) => i + 1).map(s => (
                    <option key={s} value={s} style={{ backgroundColor: 'var(--color-surface)' }}>{t('season')} {s}</option>
                  ))}
                </select>
              )}

              {/* Episode select */}
              {isTV && (
                <select
                  value={selectedEpisode}
                  onChange={e => setEpisode(Number(e.target.value))}
                  className="text-xs px-2 py-1.5 rounded-lg cursor-pointer focus:outline-none flex-shrink-0"
                  style={{
                    backgroundColor: 'var(--color-overlay)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map(ep => (
                    <option key={ep} value={ep} style={{ backgroundColor: 'var(--color-surface)' }}>{t('episode')} {ep}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* ── Video ── */}
          <div className="flex-1 flex items-center justify-center px-2 sm:px-4 py-3 min-h-0">
            <div className="w-full max-w-5xl aspect-video rounded-lg sm:rounded-xl overflow-hidden bg-black relative">

              {/* Loading */}
              {isLoading && !loadTimeout && iframeSrc && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0a0a0a] z-10">
                  <RefreshCw className="w-9 h-9 text-white/30 animate-spin" />
                  <p className="text-white/40 text-sm">{t('loading')}</p>
                </div>
              )}

              {/* Timeout / Error */}
              {(loadTimeout || hasError) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0a0a0a] p-6 text-center z-10">
                  <AlertTriangle className="w-12 h-12 text-white/30" />
                  <div>
                    <p className="text-white/80 font-medium text-sm mb-1">
                      {loadTimeout ? t('timeout') : t('loadError')}
                    </p>
                    <p className="text-white/40 text-xs mb-4">{t('tryVPN')}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    <button
                      onClick={retry}
                      className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
                    >
                      {t('retry')}
                    </button>
                    {servers.map((srv, idx) => idx !== activeServer && (
                      <button
                        key={srv.source}
                        onClick={() => setActiveServer(idx)}
                        className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
                      >
                        {srv.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No servers */}
              {!serversLoading && servers.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-center p-6">
                  <p className="text-white/50 text-sm">{t('unavailable')}</p>
                  <p className="text-white/30 text-xs">{t('regionBlocked')}</p>
                </div>
              )}

              {/* Iframe */}
              {iframeSrc && !hasError && !loadTimeout && (
                <iframe
                  key={iframeKey}
                  src={iframeSrc}
                  className="w-full h-full"
                  onLoad={handleLoad}
                  onError={handleError}
                  allowFullScreen
                  allow="autoplay; fullscreen; picture-in-picture"
                  frameBorder="0"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${title} — Video Player`}
                />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
