export interface AniLibriaTitle {
  id: number
  code: string
  names: {
    ru: string
    en: string
    alternative: string | null
  }
  announce: string | null
  status: {
    string: string
    code: number
  }
  posters: {
    small: { url: string }
    medium: { url: string }
    original: { url: string }
  }
  updated: number
  last_change: number
  type: {
    full_string: string
    code: number
    string: string
    series: number | null
    length: string | null
  }
  genres: string[]
  team: {
    voice: string[]
    translator: string[]
    editing: string[]
    decor: string[]
    timing: string[]
  }
  season: {
    string: string
    code: number
    year: number
    week_day: number | null
  }
  description: string
  in_favorites: number
  blocked: {
    blocked: boolean
    bakanim: boolean
  }
  player: {
    alternative_player: string | null
    host: string
    series: {
      first: number
      last: number
      string: string
    }
    list: {
      [episode: string]: AniEpisode
    }
  }
  torrents: {
    episodes: { first: number; last: number; string: string }
    list: unknown[]
  }
}

export interface AniEpisode {
  serie: number
  created_timestamp: number
  preview: string | null
  skips: { opening: number[]; ending: number[] }
  hls: {
    fhd: string | null
    hd: string | null
    sd: string | null
  }
}
