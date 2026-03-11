import { notFound } from 'next/navigation'
import Image from 'next/image'
import { fetchAniTitle, getPosterUrl } from '@/lib/anilibria'
import AniPlayerButton from '@/components/anime/AniPlayerButton'
import AniEpisodesGrid from '@/components/anime/AniEpisodesGrid'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props) {
  try {
    const title = await fetchAniTitle(parseInt(params.id))
    return { title: `${title.names.ru} — SpaceFeel` }
  } catch {
    return { title: 'SpaceFeel' }
  }
}

export default async function AniDetailPage({ params }: Props) {
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  let title
  try {
    title = await fetchAniTitle(id)
  } catch {
    notFound()
  }

  const poster = getPosterUrl(title.posters.original.url)
  const episodes = Object.values(title.player.list).sort((a, b) => a.serie - b.serie)

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Hero section */}
      <div className="relative w-full pt-24 pb-12 px-6">
        <div className="max-w-5xl mx-auto flex gap-8 flex-wrap sm:flex-nowrap">
          {/* Poster */}
          <div className="relative w-44 h-64 flex-shrink-0 rounded-2xl overflow-hidden">
            <Image
              src={poster}
              fill
              className="object-cover"
              alt={title.names.ru}
              priority
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1
              className="text-4xl font-black tracking-tight"
              style={{ color: 'var(--color-text)' }}
            >
              {title.names.ru}
            </h1>
            {title.names.en && (
              <p className="text-lg mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {title.names.en}
              </p>
            )}

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mt-4">
              {title.genres.slice(0, 5).map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 rounded-full text-xs border"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Meta */}
            <div
              className="flex gap-6 mt-4 text-sm flex-wrap"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <span>{title.season?.year}</span>
              <span>{title.type?.full_string}</span>
              <span>{title.player.series?.string}</span>
              <span>{title.status?.string}</span>
            </div>

            {/* Description */}
            <p
              className="mt-4 text-sm leading-relaxed line-clamp-4"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {title.description}
            </p>

            {/* Play button */}
            {episodes.length > 0 && (
              <div className="flex gap-3 mt-6">
                <AniPlayerButton
                  episodes={episodes}
                  host={title.player.host}
                  titleName={title.names.ru}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Episodes grid */}
      {episodes.length > 0 && (
        <AniEpisodesGrid
          episodes={episodes}
          host={title.player.host}
          titleName={title.names.ru}
        />
      )}
    </main>
  )
}
