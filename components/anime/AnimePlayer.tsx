'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, Volume2, Maximize, Settings } from 'lucide-react'
import Hls from 'hls.js'
import { AnimeSource } from '@/lib/animeSources'
import { buildAnilibriaSource, searchByShikimori as searchAnilibria } from '@/services/anilibria'
import { buildAnimeVostSource } from '@/services/animevost'
import { YaniVideo } from '@/types/yani'

type ServerType = 'yummy' | 'libria' | 'vost'

interface AnimePlayerProps {
  shikimoriId: number
  title: string
  yaniVideos: YaniVideo[]
  initialEpisode?: number
}

export default function AnimePlayer({
  shikimoriId,
  yaniVideos,
  initialEpisode = 1,
}: AnimePlayerProps) {
  // Server state
  const [activeServer, setActiveServer] = useState<ServerType>('yummy')
  const [sources, setSources] = useState<Record<ServerType, AnimeSource | null>>({
    yummy: null,
    libria: null,
    vost: null,
  })
  const [isLoadingSources, setIsLoadingSources] = useState(true)

  // Episode/Translation state
  const [currentEpisode, setCurrentEpisode] = useState(String(initialEpisode))
  const [currentTranslation, setCurrentTranslation] = useState<string>('')

  // Player state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)

  // Video ref
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize sources
  useEffect(() => {
    const initSources = async () => {
      setIsLoadingSources(true)

      // Yummy (Yani) - already available
      const yummySource: AnimeSource = {
        id: 'yummy',
        name: 'Yummy (Alloha)',
        type: 'yummy',
        available: yaniVideos.length > 0,
        episodes: yaniVideos.map(v => ({
          number: v.number,
          iframeUrl: v.iframe_url.startsWith('//') ? `https:${v.iframe_url}` : v.iframe_url,
          quality: 'HD',
        })),
        translations: Array.from(new Set(yaniVideos.map(v => v.data.dubbing))),
      }

      // Fetch AniLibria
      const libriaPromise = (async () => {
        try {
          const release = await searchAnilibria(shikimoriId)
          if (release) {
            return buildAnilibriaSource(release)
          }
          return null
        } catch {
          return null
        }
      })()

      // Fetch AnimeVost
      const vostPromise = buildAnimeVostSource(shikimoriId)

      const [libria, vost] = await Promise.all([libriaPromise, vostPromise])

      setSources({
        yummy: yummySource,
        libria,
        vost,
      })

      setIsLoadingSources(false)
    }

    initSources()
  }, [shikimoriId, yaniVideos])

  // Get active source
  const activeSource = sources[activeServer]

  // Get episodes for active source
  const episodes = activeSource?.episodes || []

  // Get translations for active source
  const translations = activeSource?.translations || []

  // Get current episode URL
  const currentEpisodeData = episodes.find(ep => ep.number === currentEpisode)
  const currentUrl = currentEpisodeData?.hlsUrl || currentEpisodeData?.iframeUrl

  // Initialize HLS player
  const initHls = useCallback((url: string) => {
    if (!videoRef.current) return

    // Clean up previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        autoStartLoad: true,
        startPosition: 0,
        debug: false,
      })

      hls.loadSource(url)
      hls.attachMedia(videoRef.current)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play()
        setIsPlaying(true)
      })

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error('HLS fatal error:', data)
        }
      })

      hlsRef.current = hls
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = url
      videoRef.current.addEventListener('loadedmetadata', () => {
        videoRef.current?.play()
        setIsPlaying(true)
      })
    }
  }, [])

  // Handle URL change
  useEffect(() => {
    if (currentUrl && activeServer !== 'yummy') {
      initHls(currentUrl)
    }
  }, [currentUrl, activeServer, initHls])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [])

  // Toggle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  // Handle duration change
  const handleDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  // Toggle fullscreen
  const toggleFullscreen = async () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  }

  // Format time
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Handle server change
  const handleServerChange = (server: ServerType) => {
    setActiveServer(server)
    const source = sources[server]
    if (source?.episodes.length) {
      setCurrentEpisode(source.episodes[0].number)
    }
    if (source?.translations.length) {
      setCurrentTranslation(source.translations[0])
    }
  }

  // Loading skeleton
  if (isLoadingSources) {
    return (
      <div
        className="w-full aspect-video rounded-2xl overflow-hidden animate-pulse"
        style={{ backgroundColor: 'var(--color-card)' }}
      >
        <div className="h-full w-full" style={{ background: 'linear-gradient(135deg, var(--color-overlay) 0%, transparent 100%)' }} />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-card)' }}>
      {/* Server Selector */}
      <div className="flex items-center gap-2 p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        {(['yummy', 'libria', 'vost'] as ServerType[]).map((server) => {
          const source = sources[server]
          const isActive = activeServer === server

          return (
            <button
              key={server}
              onClick={() => handleServerChange(server)}
              disabled={!source?.available}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                !source?.available ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={
                isActive
                  ? { background: 'linear-gradient(to right, #6366f1, #a855f7)', color: '#ffffff' }
                  : { backgroundColor: 'var(--color-overlay)', color: 'var(--color-text-muted)' }
              }
            >
              {source?.name || server}
            </button>
          )
        })}
      </div>

      {/* Video Container */}
      <div className="relative aspect-video bg-black">
        {activeServer === 'yummy' ? (
          // Yummy uses iframe
          currentEpisodeData?.iframeUrl ? (
            <iframe
              src={currentEpisodeData.iframeUrl}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture"
              frameBorder="0"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white/40">
              No video available
            </div>
          )
        ) : (
          // Libria/Vost use HLS
          <video
            ref={videoRef}
            className="w-full h-full"
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={handleDurationChange}
            onClick={togglePlay}
            playsInline
          />
        )}

        {/* Custom Controls (for HLS) */}
        {activeServer !== 'yummy' && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity">
            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={togglePlay} className="text-white hover:text-indigo-400">
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>

                <div className="flex items-center gap-2">
                  <Volume2 size={20} className="text-white" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 accent-indigo-500"
                  />
                </div>

                <span className="text-white/60 text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button className="text-white hover:text-indigo-400">
                  <Settings size={20} />
                </button>
                <button onClick={toggleFullscreen} className="text-white hover:text-indigo-400">
                  <Maximize size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Episode & Translation Selector */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex flex-wrap gap-4">
          {/* Translation Selector */}
          {translations.length > 1 && (
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>Озвучка</label>
              <select
                value={currentTranslation}
                onChange={(e) => setCurrentTranslation(e.target.value)}
                className="w-full rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{
                  backgroundColor: 'var(--color-overlay)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                }}
              >
                {translations.map((t) => (
                  <option key={t} value={t} style={{ backgroundColor: 'var(--color-surface)' }}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Episode Selector */}
          {episodes.length > 0 && (
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>Серия</label>
              <select
                value={currentEpisode}
                onChange={(e) => setCurrentEpisode(e.target.value)}
                className="w-full rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{
                  backgroundColor: 'var(--color-overlay)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                }}
              >
                {episodes.map((ep) => (
                  <option key={ep.number} value={ep.number} style={{ backgroundColor: 'var(--color-surface)' }}>
                    {ep.title || `Серия ${ep.number}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
