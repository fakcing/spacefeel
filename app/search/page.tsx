'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { fetchSearch } from '@/lib/tmdb'
import { Movie, TVShow } from '@/types/tmdb'
import MediaCard from '@/components/cards/MediaCard'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [movieResults, setMovieResults] = useState<Movie[]>([])
  const [tvResults, setTvResults] = useState<TVShow[]>([])
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setMovieResults([])
      setTvResults([])
      return
    }
    setLoading(true)
    try {
      const data = await fetchSearch(q)
      const results = data.results as Array<(Movie | TVShow) & { media_type?: string }>
      setMovieResults(results.filter((r) => r.media_type === 'movie') as Movie[])
      setTvResults(results.filter((r) => r.media_type === 'tv') as TVShow[])
    } catch {
      setMovieResults([])
      setTvResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300)
    return () => clearTimeout(timer)
  }, [query, search])

  const total = movieResults.length + tvResults.length

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="relative mb-10">
        <Search size={24} className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, TV shows and more..."
          autoFocus
          className="w-full bg-transparent border-b border-[var(--border)] pl-10 pr-4 py-3 text-2xl placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--text-muted)] transition-colors text-[var(--text-primary)]"
        />
      </div>

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl shimmer" />
          ))}
        </div>
      )}

      {!loading && query && total === 0 && (
        <div className="text-center py-24">
          <p className="text-[var(--text-muted)] text-lg">No results for &quot;{query}&quot;</p>
        </div>
      )}

      {!loading && !query && (
        <div className="text-center py-32">
          <Search size={64} className="text-[var(--text-muted)] opacity-20 mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">Start typing to search movies, shows and more...</p>
        </div>
      )}

      {!loading && movieResults.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold tracking-tight mb-4 text-[var(--text-primary)]">
            Movies <span className="text-[var(--text-muted)] text-sm font-normal">({movieResults.length})</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movieResults.map((item) => (
              <MediaCard key={item.id} item={item} mediaType="movie" />
            ))}
          </div>
        </section>
      )}

      {!loading && tvResults.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold tracking-tight mb-4 text-[var(--text-primary)]">
            TV Shows <span className="text-[var(--text-muted)] text-sm font-normal">({tvResults.length})</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {tvResults.map((item) => (
              <MediaCard key={item.id} item={item} mediaType="tv" />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
