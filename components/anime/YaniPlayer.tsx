'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { Play, AlertCircle, Loader2 } from 'lucide-react'
import { YaniVideo } from '@/types/yani'

interface Props {
  tmdbId?: string | number
  shikimoriId?: string | number
  title?: string
}

export default function YaniPlayer({ tmdbId, shikimoriId, title }: Props) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [videos, setVideos] = useState<YaniVideo[]>([])
  const [currentDubbing, setCurrentDubbing] = useState<string>('')
  const [currentEpisode, setCurrentEpisode] = useState<string>('')

  // Get API token from environment variable (must be NEXT_PUBLIC_ for client-side)
  const yaniToken = process.env.NEXT_PUBLIC_YANI_TV_TOKEN

  // Fetch anime from Yani TV by Shikimori ID
  const fetchByShikimoriId = useCallback(async (id: string | number) => {
    const res = await fetch(`https://api.yani.tv/anileak/shikimori/${id}`, {
      headers: {
        'X-Application': yaniToken || '',
      },
    })
    if (!res.ok) throw new Error(`Failed to fetch by Shikimori ID: ${res.status}`)
    const data = await res.json()
    return data.response?.anime_id
  }, [yaniToken])

  // Fetch anime from Yani TV by TMDB ID
  const fetchByTmdbId = useCallback(async (id: string | number) => {
    const res = await fetch(`https://api.yani.tv/anileak/tmdb/${id}`, {
      headers: {
        'X-Application': yaniToken || '',
      },
    })
    if (!res.ok) throw new Error(`Failed to fetch by TMDB ID: ${res.status}`)
    const data = await res.json()
    return data.response?.anime_id
  }, [yaniToken])

  // Fetch videos for an anime
  const fetchVideos = useCallback(async (animeId: number) => {
    const res = await fetch(`https://api.yani.tv/anime/${animeId}/videos`, {
      headers: {
        'X-Application': yaniToken || '',
      },
    })
    if (!res.ok) throw new Error(`Failed to fetch videos: ${res.status}`)
    const data = await res.json()
    return data.response as YaniVideo[]
  }, [yaniToken])

  // Main fetch effect - runs on client side only
  useEffect(() => {
    const fetchPlayer = async () => {
      if (!yaniToken) {
        setError('API token not configured. Please set NEXT_PUBLIC_YANI_TV_TOKEN in your environment.')
        setLoading(false)
        return
      }

      if (!tmdbId && !shikimoriId) {
        setError('No ID provided. Please specify tmdbId or shikimoriId.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Get Yani anime ID
        let yaniAnimeId: number | null = null

        if (shikimoriId) {
          yaniAnimeId = await fetchByShikimoriId(shikimoriId)
        } else if (tmdbId) {
          yaniAnimeId = await fetchByTmdbId(tmdbId)
        }

        if (!yaniAnimeId) {
          setError('Anime not found on Yani TV')
          setLoading(false)
          return
        }

        // Fetch videos
        const videoData = await fetchVideos(yaniAnimeId)

        if (!videoData || videoData.length === 0) {
          setError('No videos available for this anime')
          setLoading(false)
          return
        }

        setVideos(videoData)

        // Set default dubbing (first available)
        const firstDubbing = videoData[0]?.data?.dubbing || ''
        setCurrentDubbing(firstDubbing)

        // Set default episode (first for selected dubbing)
        const firstEpForDubbing = videoData.find((v) => v.data.dubbing === firstDubbing)
        if (firstEpForDubbing) {
          setCurrentEpisode(firstEpForDubbing.number)
        }
      } catch (err) {
        console.error('YaniPlayer error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load player')
      } finally {
        setLoading(false)
      }
    }

    fetchPlayer()
  }, [tmdbId, shikimoriId, yaniToken, fetchByShikimoriId, fetchByTmdbId, fetchVideos])

  // Get unique dubbings in order of appearance
  const dubbings = useMemo(
    () => Array.from(new Set(videos.map((v) => v.data.dubbing))),
    [videos]
  )

  // Get episodes for selected dubbing, sorted by number
  const dubVideos = useMemo(
    () =>
      videos
        .filter((v) => v.data.dubbing === currentDubbing)
        .sort((a, b) => Number(a.number) - Number(b.number)),
    [videos, currentDubbing]
  )

  // Get current video iframe URL
  const iframeSrc = useMemo(() => {
    const currentVideo = dubVideos.find((v) => v.number === currentEpisode)
    if (!currentVideo?.iframe_url) return null
    const url = currentVideo.iframe_url
    return url.startsWith('//') ? `https:${url}` : url
  }, [dubVideos, currentEpisode])

  // Loading state
  if (loading) {
    return (
      <div className="relative w-full aspect-video bg-[#1a1a1b] rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 text-white/40 animate-spin" />
          <p className="text-white/40 text-sm">Loading player...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="relative w-full aspect-video bg-[#1a1a1b] rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-red-400 text-sm">{error}</p>
          {title && (
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
            >
              <Play size={14} fill="white" />
              Try Again
            </button>
          )}
        </div>
      </div>
    )
  }

  // No content state
  if (videos.length === 0) {
    return (
      <div className="relative w-full aspect-video bg-[#1a1a1b] rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <Play className="w-10 h-10 text-white/20" />
          <p className="text-white/40 text-sm">No videos available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-video bg-[#1a1a1b] rounded-lg overflow-hidden">
      {/* Controls Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-2 px-3 py-2 bg-gradient-to-b from-black/80 to-transparent">
        {/* Episode selector */}
        <div className="relative">
          <select
            value={currentEpisode}
            onChange={(e) => setCurrentEpisode(e.target.value)}
            className="appearance-none bg-white/10 text-white text-sm px-3 py-1.5 pr-8 rounded-lg border border-white/20 hover:bg-white/20 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            {dubVideos.map((ep) => (
              <option key={ep.video_id} value={ep.number} className="bg-[#1a1a1b]">
                Episode {ep.number}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
        </div>

        {/* Dubbing selector (if multiple) */}
        {dubbings.length > 1 && (
          <div className="relative">
            <select
              value={currentDubbing}
              onChange={(e) => setCurrentDubbing(e.target.value)}
              className="appearance-none bg-white/10 text-white text-sm px-3 py-1.5 pr-8 rounded-lg border border-white/20 hover:bg-white/20 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              {dubbings.map((dub) => (
                <option key={dub} value={dub} className="bg-[#1a1a1b]">
                  {dub}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
          </div>
        )}

        {/* Title (optional) */}
        {title && (
          <span className="text-white/80 text-sm truncate ml-auto hidden sm:block">
            {title}
          </span>
        )}
      </div>

      {/* Iframe */}
      {iframeSrc ? (
        <iframe
          key={iframeSrc}
          src={iframeSrc}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          frameBorder="0"
          title={title || 'Video Player'}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-white/30 text-sm">
          No video available
        </div>
      )}
    </div>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}
