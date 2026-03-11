'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { AlertTriangle, RefreshCw, Server, Check } from 'lucide-react'
import { fetchVideoCDN, fetchVideoCDNTranslations, buildVideoCDNUrl } from '@/lib/videocdn'
import { YaniVideo } from '@/types/yani'
import { VideoCDNQuality } from '@/types/videocdn'

interface UniversalPlayerProps {
  type: 'movie' | 'tv' | 'anime'
  tmdbId?: number
  shikimoriId?: number
  season?: number
  episode?: number
  yaniVideos?: YaniVideo[]
  yaniDubbing?: string
}

type ServerType = 'yani' | 'videocdn'

export default function UniversalPlayer({
  type,
  tmdbId,
  shikimoriId,
  season = 1,
  episode = 1,
  yaniVideos,
  yaniDubbing,
}: UniversalPlayerProps) {
  // Server state
  const [currentServer, setCurrentServer] = useState<ServerType>('yani')

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [loadTimeout, setLoadTimeout] = useState(false)

  // VideoCDN state
  const [videocdnQualities, setVideoCDNQualities] = useState<VideoCDNQuality[]>([])
  const [selectedQuality, setSelectedQuality] = useState<string>('auto')
  const [videocdnTranslations, setVideoCDNTranslations] = useState<{ id: number; title: string; type: 'sub' | 'dub' }[]>([])
  const [selectedTranslation, setSelectedTranslation] = useState<number | null>(null)

  // Yani iframe URL
  const yaniIframeSrc = useMemo(() => {
    if (!yaniVideos || !yaniDubbing) return null
    const video = yaniVideos.find(
      (v) => v.data.dubbing === yaniDubbing && v.number === String(episode) && (v.season ?? 1) === season
    )
    if (!video?.iframe_url) return null
    const url = video.iframe_url
    return url.startsWith('//') ? `https:${url}` : url
  }, [yaniVideos, yaniDubbing, episode, season])

  // VideoCDN iframe URL
  const videocdnIframeSrc = useMemo(() => {
    if (videocdnQualities.length === 0) return null
    const quality = videocdnQualities.find(q => q.quality === selectedQuality) || videocdnQualities[0]
    return buildVideoCDNUrl(quality)
  }, [videocdnQualities, selectedQuality])

  // Current iframe source based on selected server
  const currentIframeSrc = currentServer === 'yani' ? yaniIframeSrc : videocdnIframeSrc

  // Fetch VideoCDN data
  useEffect(() => {
    if (currentServer !== 'videocdn' && !loadTimeout && !hasError) return

    const fetchVideoCDNData = async () => {
      if (!tmdbId && type !== 'anime') return
      if (type === 'anime' && !shikimoriId) return

      try {
        const [qualities, translations] = await Promise.all([
          fetchVideoCDN({
            type,
            tmdbId: type === 'anime' ? undefined : tmdbId,
            shikimoriId: type === 'anime' ? shikimoriId : undefined,
            season,
            episode,
          }),
          fetchVideoCDNTranslations({
            type,
            tmdbId: type === 'anime' ? undefined : tmdbId,
            shikimoriId: type === 'anime' ? shikimoriId : undefined,
          }),
        ])

        if (qualities) {
          setVideoCDNQualities(qualities)
          if (qualities.length > 0 && !selectedQuality) {
            setSelectedQuality(qualities[0].quality)
          }
        }

        if (translations) {
          setVideoCDNTranslations(translations)
          if (translations.length > 0 && selectedTranslation === null) {
            setSelectedTranslation(translations[0].id)
          }
        }
      } catch (error) {
        console.error('VideoCDN fetch error:', error)
      }
    }

    fetchVideoCDNData()
  }, [type, tmdbId, shikimoriId, season, episode, currentServer, loadTimeout, hasError, selectedQuality, selectedTranslation])

  // Reset loading state when content changes
  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    setLoadTimeout(false)
  }, [currentIframeSrc, currentServer])

  // Handle iframe load
  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
    setLoadTimeout(false)
  }, [])

  // Handle iframe error
  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
  }, [])

  // Timeout detection (10 seconds)
  useEffect(() => {
    if (!isLoading) return

    const timeout = setTimeout(() => {
      if (isLoading) {
        setLoadTimeout(true)
      }
    }, 10000)

    return () => clearTimeout(timeout)
  }, [isLoading])

  // Available servers
  const availableServers = useMemo(() => {
    const servers: ServerType[] = []
    if (yaniIframeSrc) servers.push('yani')
    if (videocdnQualities.length > 0) servers.push('videocdn')
    return servers
  }, [yaniIframeSrc, videocdnQualities.length])

  // Switch server
  const switchServer = useCallback((server: ServerType) => {
    setCurrentServer(server)
    setIsLoading(true)
    setHasError(false)
    setLoadTimeout(false)
  }, [])

  // Auto-failover suggestion
  const suggestAlternative = useCallback(() => {
    if (currentServer === 'yani' && availableServers.includes('videocdn')) {
      return 'videocdn'
    }
    if (currentServer === 'videocdn' && availableServers.includes('yani')) {
      return 'yani'
    }
    return null
  }, [currentServer, availableServers])

  const alternativeServer = hasError || loadTimeout ? suggestAlternative() : null

  return (
    <div className="w-full h-full flex flex-col">
      {/* Server Switcher */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40">
        <div className="flex items-center gap-2">
          <Server size={16} className="text-white/60" />
          <span className="text-white/80 text-sm font-medium">Сервер</span>
        </div>
        <div className="flex items-center gap-2">
          {availableServers.includes('yani') && (
            <button
              onClick={() => switchServer('yani')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentServer === 'yani'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Сервер 1 (Yani)
              {currentServer === 'yani' && <Check size={12} />}
            </button>
          )}
          {availableServers.includes('videocdn') && (
            <button
              onClick={() => switchServer('videocdn')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentServer === 'videocdn'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Сервер 2 (VideoCDN)
              {currentServer === 'videocdn' && <Check size={12} />}
            </button>
          )}
        </div>
      </div>

      {/* Iframe Container */}
      <div className="flex-1 relative bg-black">
        {/* Loading State */}
        {isLoading && !loadTimeout && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 backdrop-blur-sm z-10">
            <RefreshCw className="w-10 h-10 text-white/40 animate-spin" />
            <p className="text-white/60 text-sm">Загрузка плеера...</p>
            <p className="text-white/40 text-xs">
              {currentServer === 'yani' ? 'Yani/Alloha' : 'VideoCDN'}
            </p>
          </div>
        )}

        {/* Timeout/Error State */}
        {(loadTimeout || hasError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/90 backdrop-blur-sm p-6 text-center z-10">
            <AlertTriangle className="w-12 h-12 text-yellow-400" />
            <div>
              <p className="text-white/80 font-medium mb-1">
                {loadTimeout ? 'Превышено время ожидания' : 'Ошибка загрузки'}
              </p>
              <p className="text-white/40 text-sm mb-4">
                Этот сервер не отвечает. Попробуйте другой.
              </p>
            </div>

            {alternativeServer && (
              <button
                onClick={() => switchServer(alternativeServer as ServerType)}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-sm hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/30"
              >
                <RefreshCw size={16} />
                Попробовать {alternativeServer === 'yani' ? 'Yani' : 'VideoCDN'}
              </button>
            )}

            <button
              onClick={() => {
                setIsLoading(true)
                setHasError(false)
                setLoadTimeout(false)
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* Iframe */}
        {currentIframeSrc && !hasError && !loadTimeout && (
          <iframe
            key={currentIframeSrc}
            src={currentIframeSrc}
            className="w-full h-full"
            onLoad={handleLoad}
            onError={handleError}
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
            frameBorder="0"
            title="Video Player"
          />
        )}

        {/* No Source Available */}
        {!currentIframeSrc && !isLoading && !hasError && !loadTimeout && (
          <div className="flex items-center justify-center h-full text-white/30 text-sm">
            Нет доступного видео
          </div>
        )}
      </div>

      {/* VideoCDN Controls (only when VideoCDN is selected) */}
      {currentServer === 'videocdn' && videocdnQualities.length > 0 && (
        <div className="px-4 py-3 border-t border-white/10 bg-black/40">
          {/* Quality Selector */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-white/60 text-xs font-medium">Качество:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {videocdnQualities.map((q) => (
                <button
                  key={q.quality}
                  onClick={() => setSelectedQuality(q.quality)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    selectedQuality === q.quality
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {q.quality}
                </button>
              ))}
            </div>
          </div>

          {/* Translation Selector */}
          {videocdnTranslations.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-xs font-medium">Озвучка:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {videocdnTranslations.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTranslation(t.id)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                      selectedTranslation === t.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {t.title}
                    {t.type === 'sub' && <span className="opacity-60">[SUB]</span>}
                    {t.type === 'dub' && <span className="opacity-60">[DUB]</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
