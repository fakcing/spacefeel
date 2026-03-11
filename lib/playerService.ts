import { prisma } from '@/lib/prisma'
import { PlayerServer, PlayerResponse } from '@/types/player'

const CACHE_TTL_HOURS = 24

/**
 * Simplified Player Aggregator
 * 
 * Uses direct embed URLs from known sources
 * No HTML parsing required
 */

/**
 * Generate embed URLs for all sources
 */
function generateEmbedUrls(tmdbId: number, type: 'movie' | 'tv' | 'cartoon'): { source: string; iframe: string }[] {
  const isTV = type === 'tv' || type === 'cartoon'
  
  return [
    {
      source: 'VoidBoost',
      iframe: `https://voidboost.net/embed/${tmdbId}`,
    },
    {
      source: 'Collaps',
      iframe: `https://api.collaps.org/embed/${isTV ? 'tv' : 'movie'}/${tmdbId}`,
    },
    {
      source: 'VDBaz',
      iframe: `https://vdbaz.to/embed/${isTV ? 'tv' : 'movie'}/${tmdbId}`,
    },
  ]
}

/**
 * Get cached player data if available and not expired
 */
async function getCachedPlayers(tmdbId: number, type: string): Promise<PlayerServer[]> {
  try {
    const cache = await prisma.playerCache.findMany({
      where: {
        tmdbId,
        type,
        createdAt: {
          gt: new Date(Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000), // 24 hours
        },
      },
      orderBy: {
        id: 'asc',
      },
    })

    return cache.map((c) => ({
      name: c.source,
      iframe: c.iframe,
      quality: c.quality || undefined,
      source: c.source,
    }))
  } catch (error) {
    console.error('Error fetching player cache:', error)
    return []
  }
}

/**
 * Save player data to cache
 */
async function saveToCache(
  tmdbId: number,
  type: string,
  servers: { source: string; iframe: string }[]
): Promise<void> {
  try {
    for (const server of servers) {
      await prisma.playerCache.upsert({
        where: {
          tmdbId_source_type: {
            tmdbId,
            source: server.source,
            type,
          },
        },
        update: {
          iframe: server.iframe,
        },
        create: {
          tmdbId,
          type,
          source: server.source,
          iframe: server.iframe,
        },
      })
    }
  } catch (error) {
    console.error('Error saving player cache:', error)
  }
}

/**
 * Check if iframe URL is working (not 404)
 */
async function checkIframeHealth(iframe: string): Promise<boolean> {
  try {
    // Simple HEAD request to check if URL exists
    const response = await fetch(iframe, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })
    return response.ok && response.status !== 404
  } catch {
    return false
  }
}

/**
 * Main function to get players for a movie/TV show
 */
export async function getPlayers(tmdbId: number, type: 'movie' | 'tv' | 'cartoon'): Promise<PlayerResponse> {
  const typeStr = type
  
  // Try cache first
  const cached = await getCachedPlayers(tmdbId, typeStr)
  
  if (cached.length > 0) {
    // Check if at least one server is healthy
    const healthyServers = await Promise.all(
      cached.map(async (server) => {
        const isHealthy = await checkIframeHealth(server.iframe)
        return { server, isHealthy }
      })
    )
    
    const workingServers = healthyServers
      .filter(s => s.isHealthy)
      .map(s => s.server)
    
    if (workingServers.length > 0) {
      return {
        servers: workingServers,
        cached: true,
        cachedAt: new Date(),
      }
    }
  }

  // Generate fresh embed URLs
  const servers = generateEmbedUrls(tmdbId, type)
  
  // Save to cache
  await saveToCache(tmdbId, typeStr, servers)
  
  // Build server list
  const playerServers: PlayerServer[] = servers.map((s) => ({
    name: s.source,
    iframe: s.iframe,
    source: s.source,
  }))
  
  return {
    servers: playerServers,
    cached: false,
  }
}

/**
 * Clear cache for a specific TMDB ID
 */
export async function clearPlayerCache(tmdbId: number): Promise<void> {
  try {
    await prisma.playerCache.deleteMany({
      where: { tmdbId },
    })
  } catch (error) {
    console.error('Error clearing player cache:', error)
  }
}
