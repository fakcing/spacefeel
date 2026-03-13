'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { AlertTriangle, RefreshCw, Server, ChevronLeft, ChevronRight } from 'lucide-react'

interface UniversalPlayerProps {
  type: 'movie' | 'tv' | 'anime' | 'cartoon'
  tmdbId?: number
  shikimoriId?: number
  season?: number
  episode?: number
}

interface PlayerServer {
  name: string
  iframe: string
  source: string
}

export default function UniversalPlayer({
  type,
  tmdbId,
  season: propSeason = 1,
  episode: propEpisode = 1,
}: UniversalPlayerProps) {
  const [servers, setServers] = useState<PlayerServer[]>([])
  const [activeServer, setActiveServer] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [serversLoading, setServersLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [loadTimeout, setLoadTimeout] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const [selectedSeason, setSelectedSeason] = useState(propSeason)
  const [selectedEpisode, setSelectedEpisode] = useState(propEpisode)

  // Fetch servers from API
  useEffect(() => {
    if (!tmdbId) return
    const t = type === 'cartoon' ? 'movie' : type === 'anime' ? 'tv' : type
    setServersLoading(true)
    fetch(`/api/player/${tmdbId}?type=${t}`)
      .then(r => r.json())
      .then(data => {
        if (data.servers && data.servers.length > 0) {
          setServers(data.servers)
          setActiveServer(0)
        }
      })
      .catch(() => {})
      .finally(() => setServersLoading(false))
  }, [tmdbId, type])

  // Build iframe src with season/episode params for TV
  const iframeSrc = useMemo(() => {
    if (servers.length === 0) return null
    const server = servers[activeServer]
    if (!server) return null
    let url = server.iframe
    // Append season/episode for TV/cartoon
    if ((type === 'tv' || type === 'cartoon') && selectedSeason && selectedEpisode) {
      const sep = url.includes('?') ? '&' : '?'
      url += `${sep}season=${selectedSeason}&episode=${selectedEpisode}`
    }
    return url
  }, [servers, activeServer, type, selectedSeason, selectedEpisode])

  // Reset iframe state on src change
  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    setLoadTimeout(false)
    setIframeKey(p => p + 1)
  }, [iframeSrc])

  // Sync props
  useEffect(() => { setSelectedSeason(propSeason) }, [propSeason])
  useEffect(() => { setSelectedEpisode(propEpisode) }, [propEpisode])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
    setLoadTimeout(false)
  }, [])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
  }, [])

  // 10s timeout
  useEffect(() => {
    if (!isLoading) return
    const timeout = setTimeout(() => setLoadTimeout(true), 10000)
    return () => clearTimeout(timeout)
  }, [isLoading, iframeKey])

  const retry = () => {
    setIsLoading(true)
    setHasError(false)
    setLoadTimeout(false)
    setIframeKey(p => p + 1)
  }

  return (
    <div className="w-full h-full flex flex-col bg-black">
      {/* Server selector */}
      {(servers.length > 1 || serversLoading) && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 flex-shrink-0 flex-wrap">
          <Server size={13} className="text-white/40 flex-shrink-0" />
          <span className="text-white/40 text-xs flex-shrink-0">Сервер:</span>
          {serversLoading ? (
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="h-7 w-20 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            servers.map((srv, idx) => (
              <button
                key={srv.source}
                onClick={() => setActiveServer(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeServer === idx
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {srv.name}
              </button>
            ))
          )}
        </div>
      )}

      {/* Season/episode selector for TV */}
      {(type === 'tv' || type === 'cartoon') && (
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/10 flex-shrink-0 flex-wrap">
          {/* Season */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedSeason(s => Math.max(1, s - 1))}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={14} className="text-white" />
            </button>
            <span className="text-white text-sm px-2 min-w-[70px] text-center">Сезон {selectedSeason}</span>
            <button
              onClick={() => setSelectedSeason(s => s + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={14} className="text-white" />
            </button>
          </div>
          <div className="w-px h-5 bg-white/10" />
          {/* Episode */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedEpisode(e => Math.max(1, e - 1))}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={14} className="text-white" />
            </button>
            <span className="text-white text-sm px-2 min-w-[70px] text-center">Серия {selectedEpisode}</span>
            <button
              onClick={() => setSelectedEpisode(e => e + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={14} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Iframe container */}
      <div className="flex-1 relative">
        {/* Loading */}
        {isLoading && !loadTimeout && iframeSrc && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black z-10">
            <RefreshCw className="w-8 h-8 text-white/30 animate-spin" />
            <p className="text-white/40 text-sm">Загрузка плеера...</p>
          </div>
        )}

        {/* Timeout / Error */}
        {(loadTimeout || hasError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black p-6 text-center z-10">
            <AlertTriangle className="w-12 h-12 text-white/30" />
            <div>
              <p className="text-white/80 font-medium text-sm mb-1">
                {loadTimeout ? 'Превышено время ожидания' : 'Ошибка загрузки'}
              </p>
              <p className="text-white/40 text-xs mb-4">
                Попробуйте другой сервер или включите VPN
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={retry}
                className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Повторить
              </button>
              {servers.length > 1 && activeServer < servers.length - 1 && (
                <button
                  onClick={() => setActiveServer(activeServer + 1)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
                >
                  Следующий сервер
                </button>
              )}
            </div>
          </div>
        )}

        {/* No servers available */}
        {!serversLoading && servers.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center p-6">
            <p className="text-white/50 text-sm">Видео недоступно</p>
            <p className="text-white/30 text-xs">Контент может быть недоступен в вашем регионе</p>
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
            title="Video Player"
          />
        )}
      </div>
    </div>
  )
}
