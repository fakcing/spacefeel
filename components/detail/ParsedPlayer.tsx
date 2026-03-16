'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, RefreshCw, Server } from 'lucide-react'
import { PlayerServer } from '@/types/player'

interface ParsedPlayerProps {
  tmdbId?: number
  type?: 'movie' | 'tv' | 'cartoon'
  season?: number
  episode?: number
}

export default function ParsedPlayer({
  tmdbId: propTmdbId,
  type: propType,
  season = 1,
  episode = 1,
}: ParsedPlayerProps) {
  const [servers, setServers] = useState<PlayerServer[]>([])
  const [selectedServer, setSelectedServer] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cached, setCached] = useState(false)

  // Auto-detect tmdbId and type from URL if not provided
  const [tmdbId, setTmdbId] = useState(propTmdbId)
  const [type, setType] = useState(propType)

  useEffect(() => {
    // If tmdbId not provided, try to extract from URL
    if (!propTmdbId && typeof window !== 'undefined') {
      const path = window.location.pathname
      const segments = path.split('/').filter(Boolean)
      
      // Pattern: /movies/[id], /tv/[id], /cartoons/[id]
      const detectedId = segments[segments.length - 1]
      const detectedType = segments[0]
      
      const id = parseInt(detectedId)
      if (!isNaN(id)) {
        setTmdbId(id)
      }
      
      // Map URL type to our type
      if (detectedType === 'movies') setType('movie')
      else if (detectedType === 'tv') setType('tv')
      else if (detectedType === 'cartoons') setType('cartoon')
    } else {
      setTmdbId(propTmdbId)
      setType(propType)
    }
  }, [propTmdbId, propType])

  useEffect(() => {
    if (!tmdbId || !type) return

    const fetchPlayers = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          type,
          ...(type === 'tv' && { season: String(season), episode: String(episode) }),
        })

        const res = await fetch(`/api/player/${tmdbId}?${params}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load players')
        }

        setServers(data.servers || [])
        setCached(data.cached)
        setSelectedServer(0)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlayers()
  }, [tmdbId, type, season, episode])

  if (isLoading) {
    return (
      <div className="w-full aspect-video flex flex-col items-center justify-center gap-3" style={{ backgroundColor: 'var(--color-card)' }}>
        <RefreshCw className="w-10 h-10 animate-spin" style={{ color: 'var(--color-text-subtle)' }} />
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading video sources...</p>
      </div>
    )
  }

  if (error || servers.length === 0) {
    return (
      <div className="w-full aspect-video flex flex-col items-center justify-center gap-4 p-6 text-center" style={{ backgroundColor: 'var(--color-card)' }}>
        <AlertTriangle className="w-12 h-12 text-yellow-400" />
        <div>
          <p className="font-medium mb-1" style={{ color: 'var(--color-text)' }}>
            {error || 'No video sources available'}
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-subtle)' }}>
            This title may not have available sources yet.
          </p>
        </div>
      </div>
    )
  }

  const currentServer = servers[selectedServer]

  return (
    <div className="w-full flex flex-col">
      {/* Server Selector */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <div className="flex items-center gap-2">
          <Server size={16} style={{ color: 'var(--color-text-muted)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Server</span>
          {cached && (
            <span className="text-xs text-green-500 ml-2">(cached)</span>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {servers.map((server, index) => (
            <button
              key={server.source}
              onClick={() => setSelectedServer(index)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap"
              style={
                selectedServer === index
                  ? { background: 'linear-gradient(to right, #3b82f6, #a855f7)', color: '#ffffff' }
                  : { backgroundColor: 'var(--color-overlay)', color: 'var(--color-text-muted)' }
              }
            >
              {server.name}
            </button>
          ))}
        </div>
      </div>

      {/* Iframe */}
      <div className="relative aspect-video bg-black">
        <iframe
          key={currentServer.iframe}
          src={currentServer.iframe}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          frameBorder="0"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Video Server ${selectedServer + 1}`}
        />
      </div>
    </div>
  )
}
