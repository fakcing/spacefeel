export interface YaniAnime {
  anime_id: number
  anime_url: string
  title: string
  description: string
  year: number
  poster: {
    small: string
    medium: string
    big: string
    huge: string
    fullsize: string
  }
  rating: {
    average: number
    counters: number
    myanimelist_rating: number
    worldart_rating: number
    shikimori_rating: number
    kp_rating: number
  }
  type: {
    name: string
    value: number
    alias: string
  }
  genres: { title: string; id: number; alias: string }[]
  episodes: {
    count: number
    aired: number
    next_date: number
    prev_date: number
  }
  translates: {
    value: number
    title: string
    href: string
  }[]
  min_age: {
    value: number
    title: string
    title_long: string
  }
  anime_status: {
    value: number
    title: string
    alias: string
  }
  views: number
  season: number
}

export interface YaniVideo {
  video_id: number
  data: {
    player: string
    dubbing: string
    player_id: number
    season?: number
  }
  number: string
  date: number
  iframe_url: string
  index: number
  skips: {
    opening: { time: number; length: number } | null
    ending: { time: number; length: number } | null
  }
  views: number
  duration: number
  season?: number
}
