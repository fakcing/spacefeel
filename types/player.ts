export interface PlayerServer {
  name: string
  iframe: string
  quality?: string
  source: string
  /** Query param name for season (default: 'season') */
  seasonKey?: string
  /** Query param name for episode (default: 'episode') */
  episodeKey?: string
}

export interface PlayerResponse {
  servers: PlayerServer[]
  cached: boolean
  cachedAt?: Date
}

export interface ParserResult {
  source: string
  iframe: string | null
  quality?: string
  error?: string
}
