'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { AlertTriangle, RefreshCw, Server, Check, ChevronDown } from 'lucide-react'
import { fetchVideoCDN, fetchVideoCDNTranslations, buildVideoCDNUrl } from '@/lib/videocdn'
import { YaniVideo } from '@/types/yani'
import { VideoCDNQuality } from '@/types/videocdn'

interface UniversalPlayerProps {
  type: 'movie' | 'tv' | 'anime' | 'cartoon'
  tmdbId?: number
  shikimoriId?: number
  season?: number
  episode?: number
  yaniVideos?: YaniVideo[]
  yaniDubbing?: string
}

interface Episode {
  number: number
  title?: string
}

interface Season {
  number: number
  episodes: Episode[]
}

type ServerType = 'yani' | 'videocdn'

const STORAGE_SERVER_KEY = 'spacefeel_player_server'
const STORAGE_DUBBING_KEY = 'spacefeel_player_dubbing'

export default function UniversalPlayer({
  type,
  tmdbId,
  shikimoriId,
  season: propSeason,
  episode: propEpisode,
  yaniVideos,
  yaniDubbing,
}: UniversalPlayerProps) {
  // Server state
  const [currentServer, setCurrentServer] = useState<ServerType>(() => {
    if (typeof window === 'undefined') return 'yani'
    return (localStorage.getItem(STORAGE_SERVER_KEY) as ServerType) || 'yani'
  })

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [loadTimeout, setLoadTimeout] = useState(false)

  // Season/Episode state
  const [selectedSeason, setSelectedSeason] = useState(propSeason || 1)
  const [selectedEpisode, setSelectedEpisode] = useState(propEpisode || 1)

  // VideoCDN state
  const [videocdnQualities, setVideoCDNQualities] = useState<VideoCDNQuality[]>([])
  const [videocdnTranslations, setVideoCDNTranslations] = useState<{ id: number; title: string; type: 'sub' | 'dub'; language?: string }[]>([])
  const [selectedTranslation, setSelectedTranslation] = useState<number>(() => {
    if (typeof window === 'undefined') return 1
    return Number(localStorage.getItem(STORAGE_DUBBING_KEY)) || 1
  })

  // Yani seasons/episodes extraction
  const yaniSeasons = useMemo(() => {
    if (!yaniVideos) return []

    const seasonMap = new Map<number, Set<number>>()
    
    yaniVideos.forEach((video) => {
      const season = video.season ?? 1
      const episode = Number(video.number)
      
      if (!seasonMap.has(season)) {
        seasonMap.set(season, new Set())
      }
      seasonMap.get(season)!.add(episode)
    })

    const seasons: Season[] = []
    seasonMap.forEach((episodes, season) => {
      seasons.push({
        number: season,
        episodes: Array.from(episodes).map(num => ({ number: num })),
      })
    })

    return seasons.sort((a, b) => a.number - b.number)
  }, [yaniVideos])

  // Yani unique episodes for current season
  const yaniEpisodes = useMemo(() => {
    if (!yaniVideos) return []
    
    const episodeSet = new Set<number>()
    yaniVideos
      .filter((v) => (v.season ?? 1) === selectedSeason)
      .forEach((v) => episodeSet.add(Number(v.number)))
    
    return Array.from(episodeSet).sort((a, b) => a - b)
  }, [yaniVideos, selectedSeason])

  // Yani iframe URL
  const yaniIframeSrc = useMemo(() => {
    if (!yaniVideos || !yaniDubbing) return null
    const video = yaniVideos.find(
      (v) => v.data.dubbing === yaniDubbing && Number(v.number) === selectedEpisode && (v.season ?? 1) === selectedSeason
    )
    if (!video?.iframe_url) return null
    const url = video.iframe_url
    return url.startsWith('//') ? `https:${url}` : url
  }, [yaniVideos, yaniDubbing, selectedEpisode, selectedSeason])

  // VideoCDN iframe URL
  const videocdnIframeSrc = useMemo(() => {
    if (videocdnQualities.length === 0) return null
    const quality = videocdnQualities[0]
    return buildVideoCDNUrl(quality)
  }, [videocdnQualities])

  // Current iframe source
  const currentIframeSrc = currentServer === 'yani' ? yaniIframeSrc : videocdnIframeSrc

  // Save server preference
  useEffect(() => {
    localStorage.setItem(STORAGE_SERVER_KEY, currentServer)
  }, [currentServer])

  // Save dubbing preference
  useEffect(() => {
    localStorage.setItem(STORAGE_DUBBING_KEY, String(selectedTranslation))
  }, [selectedTranslation])

  // Fetch VideoCDN data
  useEffect(() => {
    const fetchVideoCDNData = async () => {
      if (type === 'anime' && !shikimoriId) return
      if (type !== 'anime' && !tmdbId) return

      try {
        const [qualities, translations] = await Promise.all([
          fetchVideoCDN({
            type: type === 'cartoon' ? 'movie' : type,
            tmdbId: type === 'anime' ? undefined : tmdbId,
            shikimoriId: type === 'anime' ? shikimoriId : undefined,
            season: selectedSeason,
            episode: selectedEpisode,
          }),
          fetchVideoCDNTranslations({
            type: type === 'cartoon' ? 'movie' : type,
            tmdbId: type === 'anime' ? undefined : tmdbId,
            shikimoriId: type === 'anime' ? shikimoriId : undefined,
          }),
        ])

        if (qualities) setVideoCDNQualities(qualities)
        if (translations) setVideoCDNTranslations(translations)
      } catch (error) {
        console.error('VideoCDN fetch error:', error)
      }
    }

    fetchVideoCDNData()
  }, [type, tmdbId, shikimoriId, selectedSeason, selectedEpisode])

  // Reset loading state
  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    setLoadTimeout(false)
  }, [currentIframeSrc, currentServer, selectedEpisode])

  // Update season/episode when props change
  useEffect(() => {
    if (propSeason) setSelectedSeason(propSeason)
    if (propEpisode) setSelectedEpisode(propEpisode)
  }, [propSeason, propEpisode])

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

  // Timeout detection (7 seconds)
  useEffect(() => {
    if (!isLoading) return

    const timeout = setTimeout(() => {
      if (isLoading) {
        setLoadTimeout(true)
      }
    }, 7000)

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

  // Suggest alternative server
  const suggestAlternative = useCallback(() => {
    if (currentServer === 'yani' && availableServers.includes('videocdn')) {
      return 'videocdn'
    }
    if (currentServer === 'videocdn' && availableServers.includes('yani')) {
      return 'yani'
    }
    return null
  }, [currentServer, availableServers])

  const alternativeServer = (hasError || loadTimeout) ? suggestAlternative() : null

  // Check if content has multiple seasons
  const hasMultipleSeasons = yaniSeasons.length > 1

  return (
    <div className="w-full h-full flex flex-col">
      {/* Server Switcher */}
      <div className="flex items-center justify-between px-4 py-2 sm:py-3 border-b border-white/10 bg-black/40">
        <div className="flex items-center gap-2">
          <Server size={16} className="text-white/60" />
          <span className="text-white/80 text-xs sm:text-sm font-medium">Сервер</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {availableServers.includes('yani') && (
            <button
              onClick={() => switchServer('yani')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all min-h-[36px] sm:min-h-[40px] ${
                currentServer === 'yani'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Сервер 1
              {currentServer === 'yani' && <Check size={12} />}
            </button>
          )}
          {availableServers.includes('videocdn') && (
            <button
              onClick={() => switchServer('videocdn')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all min-h-[36px] sm:min-h-[40px] ${
                currentServer === 'videocdn'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Сервер 2
              {currentServer === 'videocdn' && <Check size={12} />}
            </button>
          )}
        </div>
      </div>

      {/* Season/Episode Selectors (for TV/Anime/Cartoon series) */}
      {(type === 'tv' || type === 'anime' || type === 'cartoon') && hasMultipleSeasons && (
        <div className="px-4 py-2 sm:py-3 border-b border-white/10 bg-black/30">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {/* Season Selector */}
            <div className="relative">
              <select
                value={selectedSeason}
                onChange={(e) => {
                  setSelectedSeason(Number(e.target.value))
                  setSelectedEpisode(1)
                }}
                className="appearance-none bg-white/10 text-white text-sm sm:text-base px-4 py-2 sm:py-2.5 pr-10 rounded-xl border border-white/20 hover:bg-white/20 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[44px] sm:min-h-[48px]"
              >
                {yaniSeasons.map((s) => (
                  <option key={s.number} value={s.number} className="bg-[#1a1a1b] text-white">
                    Сезон {s.number}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
            </div>

            {/* Episode Selector - Horizontal scroll on mobile */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
                <span className="text-white/60 text-xs sm:text-sm font-medium flex-shrink-0">Серия:</span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {yaniEpisodes.slice(0, 20).map((ep) => (
                    <button
                      key={ep}
                      onClick={() => setSelectedEpisode(ep)}
                      className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium transition-all flex-shrink-0 touch-manipulation ${
                        selectedEpisode === ep
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-white/10 text-white/70 hover:bg-white/20 active:scale-95'
                      }`}
                    >
                      {ep}
                    </button>
                  ))}
                  {yaniEpisodes.length > 20 && (
                    <span className="text-white/40 text-xs px-2">+{yaniEpisodes.length - 20}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Iframe Container */}
      <div className="flex-1 relative bg-black">
        {/* Loading State */}
        {isLoading && !loadTimeout && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 backdrop-blur-sm z-10">
            <RefreshCw className="w-8 h-8 sm:w-10 sm:h-10 text-white/40 animate-spin" />
            <p className="text-white/60 text-xs sm:text-sm">Загрузка плеера...</p>
            <p className="text-white/40 text-[10px] sm:text-xs">
              {currentServer === 'yani' ? 'Yani/Alloha' : 'VideoCDN'}
            </p>
          </div>
        )}

        {/* Timeout/Error State */}
        {(loadTimeout || hasError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 sm:gap-4 bg-black/90 backdrop-blur-sm p-4 sm:p-6 text-center z-10">
            <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400" />
            <div>
              <p className="text-white/80 font-medium text-sm sm:text-base mb-1">
                {loadTimeout ? 'Превышено время ожидания' : 'Ошибка загрузки'}
              </p>
              <p className="text-white/40 text-xs sm:text-sm mb-3 sm:mb-4">
                Похоже, сервер заблокирован в вашем регионе. <br className="hidden sm:block" />
                Попробуйте сменить сервер или включить VPN.
              </p>
            </div>

            {alternativeServer && (
              <button
                onClick={() => switchServer(alternativeServer as ServerType)}
                className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-xs sm:text-sm hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/30 active:scale-95 min-h-[44px] sm:min-h-[48px]"
              >
                <RefreshCw size={14} className="sm:w-4 sm:h-4" />
                Попробовать {alternativeServer === 'yani' ? 'Сервер 1' : 'Сервер 2'}
              </button>
            )}

            <button
              onClick={() => {
                setIsLoading(true)
                setHasError(false)
                setLoadTimeout(false)
              }}
              className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white/10 text-white font-semibold text-xs sm:text-sm hover:bg-white/20 transition-colors active:scale-95 min-h-[44px] sm:min-h-[48px]"
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
            referrerPolicy="no-referrer-when-downgrade"
            title="Video Player"
          />
        )}

        {/* No Source Available */}
        {!currentIframeSrc && !isLoading && !hasError && !loadTimeout && (
          <div className="flex items-center justify-center h-full text-white/30 text-xs sm:text-sm">
            Нет доступного видео
          </div>
        )}
      </div>

      {/* VideoCDN Translation Selector */}
      {currentServer === 'videocdn' && videocdnTranslations.length > 1 && (
        <div className="px-4 py-2 sm:py-3 border-t border-white/10 bg-black/40">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-white/60 text-xs sm:text-sm font-medium flex-shrink-0">Озвучка:</span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {videocdnTranslations.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTranslation(t.id)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap min-h-[36px] sm:min-h-[40px] ${
                    selectedTranslation === t.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {t.title}
                  {t.type === 'sub' && <span className="opacity-60 ml-0.5">[SUB]</span>}
                  {t.type === 'dub' && <span className="opacity-60 ml-0.5">[DUB]</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
