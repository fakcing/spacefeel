import { prisma } from '@/lib/prisma'
import { PlayerServer, PlayerResponse, ParserResult } from '@/types/player'
import { parseSource1 } from '@/services/parsers/source1'
import { parseSource2 } from '@/services/parsers/source2'
import { parseSource3 } from '@/services/parsers/source3'

const CACHE_TTL_HOURS = 24

/**
 * Player Aggregator Service
 * 
 * Orchestrates all parsers and manages caching
 */

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
  source: string,
  iframe: string,
  quality?: string
): Promise<void> {
  try {
    await prisma.playerCache.upsert({
      where: {
        tmdbId_source_type: {
          tmdbId,
          source,
          type,
        },
      },
      update: {
        iframe,
        quality,
      },
      create: {
        tmdbId,
        type,
        source,
        iframe,
        quality,
      },
    })
  } catch (error) {
    console.error('Error saving player cache:', error)
  }
}

/**
 * Run all parsers and collect results
 */
async function runAllParsers(imdbId: string): Promise<ParserResult[]> {
  const parsers = [
    { name: 'Source1', fn: () => parseSource1(imdbId) },
    { name: 'Source2', fn: () => parseSource2(imdbId) },
    { name: 'Source3', fn: () => parseSource3(imdbId) },
  ]

  const results = await Promise.allSettled(parsers.map((p) => p.fn()))
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      return {
        source: parsers[index].name,
        iframe: null,
        error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
      }
    }
  })
}

/**
 * Main function to get players for a movie/TV show
 */
export async function getPlayers(tmdbId: number, type: 'movie' | 'tv' | 'cartoon', imdbId: string): Promise<PlayerResponse> {
  const typeStr = type === 'cartoon' ? 'cartoon' : type
  
  // Try cache first
  const cached = await getCachedPlayers(tmdbId, typeStr)
  
  if (cached.length > 0) {
    return {
      servers: cached,
      cached: true,
      cachedAt: new Date(),
    }
  }

  // Run all parsers
  const results = await runAllParsers(imdbId)
  
  // Filter successful results
  const successfulResults = results.filter(
    (r): r is ParserResult & { iframe: string } => r.iframe !== null
  )
  
  // Save to cache
  for (const result of successfulResults) {
    await saveToCache(tmdbId, typeStr, result.source, result.iframe, result.quality)
  }
  
  // Build server list
  const servers: PlayerServer[] = successfulResults.map((r) => ({
    name: r.source,
    iframe: r.iframe,
    quality: r.quality,
    source: r.source,
  }))
  
  return {
    servers,
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

/**
 * Clear all expired cache entries
 */
export async function clearExpiredCache(): Promise<void> {
  try {
    await prisma.playerCache.deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000),
        },
      },
    })
  } catch (error) {
    console.error('Error clearing expired cache:', error)
  }
}
