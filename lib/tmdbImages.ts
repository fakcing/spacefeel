export const IMG_BASE = 'https://image.tmdb.org/t/p'

export const getPoster = (path: string | null, size = 'w500'): string | null =>
  path ? `${IMG_BASE}/${size}${path}` : null

export const getBackdrop = (path: string | null, size = 'w1280'): string | null =>
  path ? `${IMG_BASE}/${size}${path}` : null
