'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import Hls from 'hls.js'
import { getAnimeServers, getVostHlsUrl } from '@/lib/animePlayerService'
import { AnimeServer, AnimeServerData } from '@/types/animePlayer'

interface AnimePlayerProps {
  shikimoriId: number
  title?: string
  initialEpisode?: number
}

export default function AnimePlayer({
  shikimoriId,
  title,
  initialEpisode = 1,
}: AnimePlayerProps) {
  // Server state
  const [servers, setServers] = useState<AnimeServerData[]>([])
  const [activeServer, setActiveServer] = useState<AnimeServer>('yummy')
  const [activeTranslation, setActiveTranslation] = useState<number | null>(null)
  const [activeEpisode, setActiveEpisode] = useState(initialEpisode)
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true)
  const [isPlayerLoading, setIsPlayerLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Video refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  // Fetch servers on mount
  useEffect(() => {
    const fetchServers = async () => {
      setIsLoading(true)
      setError(null)

      try {
        console.log('Fetching servers for shikimoriId:', shikimoriId)
        const serverData = await getAnimeServers(shikimoriId)
        console.log('Received servers:', serverData)
        
        const availableServers = serverData.filter(s => s.available)
        console.log('Available servers:', availableServers)
        
        if (availableServers.length === 0) {
          setError('No servers available')
          return
        }

        setServers(serverData)
        
        // Set default server (prefer Yummy if available)
        const defaultServer = availableServers.find(s => s.server === 'yummy') || availableServers[0]
        console.log('Setting default server:', defaultServer)
        setActiveServer(defaultServer.server)
        if (defaultServer.translations.length > 0) {
          setActiveTranslation(defaultServer.translations[0].id)
        }
      } catch (err) {
        console.error('Failed to load servers:', err)
        setError(err instanceof Error ? err.message : 'Failed to load servers')
      } finally {
        setIsLoading(false)
      }
    }

    fetchServers()
  }, [shikimoriId])

  // Get active server data
  const activeServerData = servers.find(s => s.server === activeServer)

  // Get available translations for active server
  const availableTranslations = activeServerData?.translations || []

  // Get available episodes for active server
  const availableEpisodes = activeServerData?.episodes || []

  // Initialize HLS player for AnimeVost
  const initializeHls = useCallback((url: string) => {
    if (!videoRef.current) return

    if (Hls.isSupported()) {
      const hls = new Hls({
        autoStartLoad: true,
        startPosition: 0,
        debug: false,
      })

      hls.loadSource(url)
      hls.attachMedia(videoRef.current)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsPlayerLoading(false)
        videoRef.current?.play()
      })

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError('Failed to load video stream')
          setIsPlayerLoading(false)
        }
      })

      hlsRef.current = hls
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      videoRef.current.src = url
      videoRef.current.addEventListener('loadedmetadata', () => {
        setIsPlayerLoading(false)
        videoRef.current?.play()
      })
    }
  }, [])

  // Cleanup HLS on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [])

  // Handle server change
  const handleServerChange = (server: AnimeServer) => {
    console.log('Switching to server:', server)
    const serverData = servers.find(s => s.server === server)
    
    if (!serverData?.available) {
      console.warn('Server not available:', server)
      return
    }
    
    setActiveServer(server)
    setIsPlayerLoading(true)
    setError(null)
    
    // Reset translation to first available
    if (serverData?.translations.length) {
      setActiveTranslation(serverData.translations[0].id)
    }
  }

  // Handle episode change
  const handleEpisodeChange = (episode: number) => {
    setActiveEpisode(episode)
    setIsPlayerLoading(true)
    setError(null)
  }

  // Render video player
  const renderVideoPlayer = () => {
    if (!activeServerData) return null

    // AnimeVost uses HLS directly
    if (activeServer === 'vost') {
      const episode = availableEpisodes.find(e => e.episode === activeEpisode)
      const hlsUrl = episode?.hlsUrl || getVostHlsUrl(shikimoriId, activeEpisode, 'HD')

      if (hlsUrl) {
        setTimeout(() => initializeHls(hlsUrl), 100)
      }

      return (
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          autoPlay
          playsInline
        />
      )
    }

    // Yummy and AniLibria use iframe
    if (activeServerData.iframe) {
      return (
        <iframe
          key={`${activeServer}-${activeEpisode}`}
          src={activeServerData.iframe}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          frameBorder="0"
          onLoad={() => setIsPlayerLoading(false)}
          title={`${title || 'Anime'} - Episode ${activeEpisode}`}
        />
      )
    }

    return null
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="w-full aspect-video bg-[#1a1a1b] rounded-3xl overflow-hidden relative">
        <div className="absolute inset-0 animate-pulse">
          <div className="h-full w-full bg-gradient-to-br from-white/[0.05] to-white/[0.02]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-10 h-10 text-white/40 animate-spin" />
              <p className="text-white/60 text-sm">Loading servers...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || servers.filter(s => s.available).length === 0) {
    return (
      <div className="w-full aspect-video bg-[#1a1a1b] rounded-3xl overflow-hidden flex flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-400" />
        <div>
          <p className="text-white/80 font-medium mb-1">
            {error || 'No servers available'}
          </p>
          <p className="text-white/40 text-sm">
            This anime may not have available sources yet.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-0">
      {/* Video Container */}
      <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/10">
        {/* Loading overlay */}
        {isPlayerLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 backdrop-blur-sm z-10">
            <RefreshCw className="w-10 h-10 text-white/40 animate-spin" />
            <p className="text-white/60 text-sm">Loading player...</p>
          </div>
        )}

        {renderVideoPlayer()}
      </div>

      {/* Server Selector (Top row) */}
      <div className="mt-4 flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
        {servers.map((server) => (
          <button
            key={server.server}
            onClick={() => handleServerChange(server.server)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeServer === server.server
                ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 scale-105'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:scale-102'
            } ${!server.available ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!server.available}
          >
            {server.name}
            {!server.available && ' (Offline)'}
          </button>
        ))}
      </div>

      {/* Translation/Episode Selector (Bottom row) */}
      <div className="mt-2 flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
        {/* Translation selector */}
        {availableTranslations.length > 1 && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-white/60 text-xs font-medium px-2">Dub:</span>
            {availableTranslations.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTranslation(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeTranslation === t.id
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {t.name}
                {t.type === 'sub' && <span className="opacity-60 ml-0.5">[SUB]</span>}
              </button>
            ))}
          </div>
        )}

        {/* Episode selector */}
        {availableEpisodes.length > 1 && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-white/60 text-xs font-medium px-2">Ep:</span>
            <div className="flex items-center gap-1.5">
              {availableEpisodes.slice(0, 20).map((ep) => (
                <button
                  key={ep.episode}
                  onClick={() => handleEpisodeChange(ep.episode)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                    activeEpisode === ep.episode
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {ep.episode}
                </button>
              ))}
              {availableEpisodes.length > 20 && (
                <span className="text-white/40 text-xs px-2">
                  +{availableEpisodes.length - 20}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Title (optional) */}
      {title && (
        <div className="mt-3 px-2">
          <h3 className="text-white/80 font-semibold text-sm truncate">{title}</h3>
          <p className="text-white/40 text-xs">
            Season {activeServerData?.episodes[0]?.episode ? '1' : '1'} • Episode {activeEpisode}
          </p>
        </div>
      )}
    </div>
  )
}
