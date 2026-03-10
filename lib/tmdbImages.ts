export const IMG_BASE = 'https://image.tmdb.org/t/p'

export const getPoster = (path: string | null, size: 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w342'): string | null =>
  path ? `${IMG_BASE}/${size}${path}` : null

export const getBackdrop = (path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280'): string | null =>
  path ? `${IMG_BASE}/${size}${path}` : null

export const getAvatar = (path: string | null): string | null =>
  path ? `${IMG_BASE}/w185${path}` : null
