'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Search, Loader2, X } from 'lucide-react'
import { Movie, TVShow } from '@/types/tmdb'
import { YaniAnime } from '@/types/yani'
import MediaCard from '@/components/cards/MediaCard'
import AniCard from '@/components/cards/AniCard'
import Pagination from '@/components/ui/Pagination'

type Tab = 'all' | 'movie' | 'tv' | 'anime'

interface SearchData {
  movies: Movie[]
  tvShows: TVShow[]
  anime: YaniAnime[]
  moviePages: number
  tvPages: number
}

export default function SearchPage() {
  const t = useTranslations('search')
  const th = useTranslations('home')
  const locale = useLocale()

  const [query, setQuery] = useState('')
  const [type, setType] = useState<Tab>('all')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<SearchData>({ movies: [], tvShows: [], anime: [], moviePages: 1, tvPages: 1 })
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchResults = useCallback(async (q: string, t: Tab, p: number) => {
    if (q.trim().length < 2) {
      setData({ movies: [], tvShows: [], anime: [], moviePages: 1, tvPages: 1 })
      setLoading(false)
      return
    }
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    setLoading(true)
    try {
      const params = new URLSearchParams({ q, type: t, page: String(p), locale })
      const res = await fetch(`/api/search?${params}`, { signal: abortRef.current.signal })
      const json = await res.json()
      setData(json)
    } catch {
      // aborted or network error
    } finally {
      setLoading(false)
    }
  }, [locale])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      fetchResults(query, type, 1)
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, type, fetchResults])

  useEffect(() => {
    if (page > 1) fetchResults(query, type, page)
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTypeChange = (t: Tab) => { setType(t); setPage(1) }

  const total = data.movies.length + data.tvShows.length + data.anime.length

  const TYPES: { value: Tab; label: string }[] = [
    { value: 'all',   label: t('all') },
    { value: 'movie', label: t('movies') },
    { value: 'tv',    label: t('tvShows') },
    { value: 'anime', label: t('anime') },
  ]

  return (
    <div className="min-h-screen">
      {/* Header zone */}
      <div className="relative pt-20 pb-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, var(--color-overlay) 0%, transparent 100%)' }} />
        <div className="relative px-4 md:px-8 max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.05em' }}>
            {t('pageTitle')}
          </h1>

          {/* Search input */}
          <div
            className="flex items-center rounded-xl px-4 py-3 gap-3 max-w-2xl transition-all"
            style={{ backgroundColor: 'var(--color-overlay)', border: '1px solid var(--color-border-strong)' }}
          >
            {loading
              ? <Loader2 size={16} className="flex-shrink-0 animate-spin" style={{ color: 'var(--color-text-subtle)' }} />
              : <Search size={16} className="flex-shrink-0" style={{ color: 'var(--color-text-subtle)' }} />
            }
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('placeholder')}
              autoFocus
              className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-40"
              style={{ color: 'var(--color-text)' }}
            />
            {query && (
              <button onClick={() => setQuery('')} className="flex-shrink-0 transition-opacity hover:opacity-70">
                <X size={14} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 max-w-7xl mx-auto pb-24">
        {/* Type tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 -mx-4 px-4 md:mx-0 md:px-0">
          {TYPES.map(tab => {
            const isActive = type === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => handleTypeChange(tab.value)}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor: isActive ? 'var(--color-text)' : 'var(--color-overlay)',
                  color: isActive ? 'var(--color-bg)' : 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Results */}
        {query.trim().length < 2 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <Search size={36} style={{ color: 'var(--color-text-subtle)', opacity: 0.4 }} />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('typeHint')}</p>
          </div>
        ) : !loading && total === 0 ? (
          <div className="text-center py-24">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('noResults')}</p>
          </div>
        ) : (
          <>
            {type === 'all' && (
              <div className="space-y-10">
                {data.movies.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>{t('movies')}</h2>
                      <button onClick={() => handleTypeChange('movie')} className="text-xs transition-opacity hover:opacity-70" style={{ color: 'var(--color-text-subtle)' }}>
                        {th('viewAll')} →
                      </button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                      {data.movies.map((m, i) => <MediaCard key={m.id} item={m} mediaType="movie" priority={i < 3} />)}
                    </div>
                  </section>
                )}
                {data.tvShows.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>{t('tvShows')}</h2>
                      <button onClick={() => handleTypeChange('tv')} className="text-xs transition-opacity hover:opacity-70" style={{ color: 'var(--color-text-subtle)' }}>
                        {th('viewAll')} →
                      </button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                      {data.tvShows.map(s => <MediaCard key={s.id} item={s} mediaType="tv" />)}
                    </div>
                  </section>
                )}
                {data.anime.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>{t('anime')}</h2>
                      <button onClick={() => handleTypeChange('anime')} className="text-xs transition-opacity hover:opacity-70" style={{ color: 'var(--color-text-subtle)' }}>
                        {th('viewAll')} →
                      </button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                      {data.anime.map(a => <AniCard key={a.anime_id} item={a} />)}
                    </div>
                  </section>
                )}
              </div>
            )}

            {type === 'movie' && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                  {data.movies.map((m, i) => <MediaCard key={m.id} item={m} mediaType="movie" priority={i < 6} />)}
                </div>
                <Pagination currentPage={page} totalPages={data.moviePages} baseHref="/search" onPageChange={setPage} />
              </>
            )}

            {type === 'tv' && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                  {data.tvShows.map((s, i) => <MediaCard key={s.id} item={s} mediaType="tv" priority={i < 6} />)}
                </div>
                <Pagination currentPage={page} totalPages={data.tvPages} baseHref="/search" onPageChange={setPage} />
              </>
            )}

            {type === 'anime' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {data.anime.map(a => <AniCard key={a.anime_id} item={a} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
