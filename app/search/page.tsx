import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { fetchSearchMovies, fetchSearchTV } from '@/lib/tmdb'
import { searchYani } from '@/lib/yani'
import { Movie, TVShow } from '@/types/tmdb'
import { YaniAnime } from '@/types/yani'
import MediaCard from '@/components/cards/MediaCard'
import AniCard from '@/components/cards/AniCard'
import Pagination from '@/components/ui/Pagination'
import SearchPageInput from '@/components/search/SearchPageInput'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; type?: string; page?: string }
}) {
  const q = searchParams.q || ''
  const type = searchParams.type || 'all'
  const page = Math.max(1, parseInt(searchParams.page || '1') || 1)

  const t = await getTranslations('search')
  const th = await getTranslations('home')

  let movies: Movie[] = []
  let tvShows: TVShow[] = []
  let anime: YaniAnime[] = []
  let moviePages = 1
  let tvPages = 1

  if (q.trim().length >= 2) {
    if (type === 'all') {
      const [movieRes, tvRes, animeRes] = await Promise.all([
        fetchSearchMovies(q).catch(() => ({ results: [], total_pages: 0 })),
        fetchSearchTV(q).catch(() => ({ results: [], total_pages: 0 })),
        searchYani(q, 8).catch(() => [] as YaniAnime[]),
      ])
      movies = (movieRes.results as Movie[]).filter(m => !(m.genre_ids ?? []).includes(16)).slice(0, 6)
      tvShows = (tvRes.results as TVShow[]).filter(s => !(s.genre_ids ?? []).includes(16)).slice(0, 6)
      anime = animeRes
    } else if (type === 'movie') {
      const movieRes = await fetchSearchMovies(q, page).catch(() => ({ results: [], total_pages: 0 }))
      movies = (movieRes.results as Movie[]).filter(m => !(m.genre_ids ?? []).includes(16))
      moviePages = movieRes.total_pages
    } else if (type === 'tv') {
      const tvRes = await fetchSearchTV(q, page).catch(() => ({ results: [], total_pages: 0 }))
      tvShows = (tvRes.results as TVShow[]).filter(s => !(s.genre_ids ?? []).includes(16))
      tvPages = tvRes.total_pages
    } else if (type === 'anime') {
      anime = await searchYani(q, 20).catch(() => [])
    }
  }

  const totalResults = movies.length + tvShows.length + anime.length
  const TYPES = [
    { value: 'all',   label: t('all') },
    { value: 'movie', label: t('movies') },
    { value: 'tv',    label: t('tvShows') },
    { value: 'anime', label: t('anime') },
  ]
  const baseHref = `/search?q=${encodeURIComponent(q)}&type=${type}`

  return (
    <div className="min-h-screen pt-14 pb-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
      <div className="mb-6 pt-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-4">
          {t('pageTitle')}
        </h1>
        <SearchPageInput initialQ={q} type={type} />
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {TYPES.map(tab => (
          <Link
            key={tab.value}
            href={`/search?q=${encodeURIComponent(q)}&type=${tab.value}`}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-colors ${
              type === tab.value
                ? 'bg-gray-900 dark:bg-white text-white dark:text-black font-semibold'
                : 'bg-black/[0.08] dark:bg-white/[0.08] hover:bg-black/[0.15] dark:hover:bg-white/[0.15] text-[var(--text-muted)]'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {!q.trim() || q.trim().length < 2 ? (
        <div className="text-center py-24">
          <p className="text-lg text-gray-500 dark:text-gray-400">{t('typeHint')}</p>
        </div>
      ) : totalResults === 0 ? (
        <div className="text-center py-24">
          <p className="text-lg text-gray-500 dark:text-gray-400">{t('noResults')}</p>
        </div>
      ) : (
        <>
          {type === 'all' && (
            <div className="space-y-10">
              {movies.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{t('movies')}</h2>
                    <Link href={`/search?q=${encodeURIComponent(q)}&type=movie`} className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      {th('viewAll')} →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                    {movies.map((m, i) => <MediaCard key={m.id} item={m} mediaType="movie" priority={i < 3} />)}
                  </div>
                </section>
              )}
              {tvShows.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{t('tvShows')}</h2>
                    <Link href={`/search?q=${encodeURIComponent(q)}&type=tv`} className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      {th('viewAll')} →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                    {tvShows.map(s => <MediaCard key={s.id} item={s} mediaType="tv" />)}
                  </div>
                </section>
              )}
              {anime.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{t('anime')}</h2>
                    <Link href={`/search?q=${encodeURIComponent(q)}&type=anime`} className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      {th('viewAll')} →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                    {anime.map(a => <AniCard key={a.anime_id} item={a} />)}
                  </div>
                </section>
              )}
            </div>
          )}

          {type === 'movie' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {movies.map((m, i) => <MediaCard key={m.id} item={m} mediaType="movie" priority={i < 6} />)}
              </div>
              <Pagination currentPage={page} totalPages={moviePages} baseHref={baseHref} />
            </>
          )}

          {type === 'tv' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {tvShows.map((s, i) => <MediaCard key={s.id} item={s} mediaType="tv" priority={i < 6} />)}
              </div>
              <Pagination currentPage={page} totalPages={tvPages} baseHref={baseHref} />
            </>
          )}

          {type === 'anime' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {anime.map(a => <AniCard key={a.anime_id} item={a} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
