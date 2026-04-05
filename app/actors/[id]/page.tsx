import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { fetchPersonDetail, fetchPersonCredits } from '@/lib/tmdb'
import { getPoster, getAvatar } from '@/lib/tmdbImages'
import { MapPin, Calendar, Film, Tv } from 'lucide-react'

interface Props {
  params: { id: string }
}

export default async function ActorPage({ params }: Props) {
  const id = Number(params.id)
  if (isNaN(id)) notFound()

  const t = await getTranslations('actor')

  const [person, credits] = await Promise.allSettled([
    fetchPersonDetail(id),
    fetchPersonCredits(id),
  ])

  if (person.status === 'rejected') notFound()

  const p = person.value
  const allCredits = credits.status === 'fulfilled' ? credits.value.cast : []

  // Deduplicate by id+media_type, sort by vote_count desc, keep ones with posters
  const seen = new Set<string>()
  const filmography = allCredits
    .filter((c) => c.poster_path)
    .filter((c) => {
      const key = `${c.media_type}-${c.id}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0))
    .slice(0, 40)

  const movies = filmography.filter((c) => c.media_type === 'movie')
  const shows = filmography.filter((c) => c.media_type === 'tv')

  const avatarUrl = getAvatar(p.profile_path)

  const formatDate = (d: string | null) => {
    if (!d) return null
    return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <main className="min-h-screen pt-20 pb-16 px-4 md:px-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-8 mb-12">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-overlay)' }}>
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={p.name}
                fill
                className="object-cover"
                sizes="192px"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Film size={48} style={{ color: 'var(--color-text-muted)' }} />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>
            {p.known_for_department}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
            {p.name}
          </h1>

          <div className="flex flex-wrap gap-4 mb-5">
            {p.birthday && (
              <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <Calendar size={14} />
                <span>{formatDate(p.birthday)}</span>
                {p.deathday && (
                  <span>— {formatDate(p.deathday)}</span>
                )}
              </div>
            )}
            {p.place_of_birth && (
              <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <MapPin size={14} />
                <span>{p.place_of_birth}</span>
              </div>
            )}
          </div>

          {p.biography && (
            <p className="text-sm leading-relaxed line-clamp-6" style={{ color: 'var(--color-text-muted)' }}>
              {p.biography}
            </p>
          )}
        </div>
      </div>

      {/* Movies */}
      {movies.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Film size={16} style={{ color: 'var(--color-text-subtle)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              {t('movies')}
            </h2>
            <span className="text-sm" style={{ color: 'var(--color-text-subtle)' }}>({movies.length})</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {movies.map((item) => {
              const poster = getPoster(item.poster_path ?? null)
              const href = `/movies/${item.id}`
              const title = item.title ?? item.name ?? ''
              const year = item.release_date ? new Date(item.release_date).getFullYear() : null
              return (
                <Link key={`movie-${item.id}`} href={href} className="group">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden mb-1.5" style={{ backgroundColor: 'var(--color-overlay)' }}>
                    {poster ? (
                      <Image
                        src={poster}
                        alt={title}
                        width={140}
                        height={210}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film size={20} style={{ color: 'var(--color-text-muted)' }} />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium line-clamp-2 leading-tight group-hover:underline" style={{ color: 'var(--color-text)' }}>
                    {title}
                  </p>
                  {year && (
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-subtle)' }}>{year}</p>
                  )}
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* TV Shows */}
      {shows.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Tv size={16} style={{ color: 'var(--color-text-subtle)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              {t('tvShows')}
            </h2>
            <span className="text-sm" style={{ color: 'var(--color-text-subtle)' }}>({shows.length})</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {shows.map((item) => {
              const poster = getPoster(item.poster_path ?? null)
              const href = `/tv/${item.id}`
              const title = item.name ?? item.title ?? ''
              const year = item.first_air_date ? new Date(item.first_air_date).getFullYear() : null
              return (
                <Link key={`tv-${item.id}`} href={href} className="group">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden mb-1.5" style={{ backgroundColor: 'var(--color-overlay)' }}>
                    {poster ? (
                      <Image
                        src={poster}
                        alt={title}
                        width={140}
                        height={210}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Tv size={20} style={{ color: 'var(--color-text-muted)' }} />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium line-clamp-2 leading-tight group-hover:underline" style={{ color: 'var(--color-text)' }}>
                    {title}
                  </p>
                  {year && (
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-subtle)' }}>{year}</p>
                  )}
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </main>
  )
}
