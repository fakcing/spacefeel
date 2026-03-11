export interface PlayerServer {
  name: string
  iframe: string
  quality?: string
  source: string
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
