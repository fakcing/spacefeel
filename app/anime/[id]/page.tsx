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
    const title = await fetchAniTitle(params.id)
    return { title: `${title.name.main} — SpaceFeel` }
  } catch {
    return { title: 'SpaceFeel' }
  }
}

export default async function AniDetailPage({ params }: Props) {
  let title
  try {
    title = await fetchAniTitle(params.id)
  } catch {
    notFound()
  }

  const poster = getPosterUrl(title.poster.optimized?.src || title.poster.src)
  const episodes = (title.episodes ?? []).sort((a, b) => a.ordinal - b.ordinal)

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
              alt={title.name.main}
              priority
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1
              className="text-4xl font-black tracking-tight"
              style={{ color: 'var(--color-text)' }}
            >
              {title.name.main}
            </h1>
            {title.name.english && (
              <p className="text-lg mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {title.name.english}
              </p>
            )}

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mt-4">
              {title.genres.slice(0, 5).map((g) => (
                <span
                  key={g.id}
                  className="px-3 py-1 rounded-full text-xs border"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {g.name}
                </span>
              ))}
            </div>

            {/* Meta */}
            <div
              className="flex gap-6 mt-4 text-sm flex-wrap"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <span>{title.year}</span>
              <span>{title.type?.value}</span>
              {title.episodes_total && <span>{title.episodes_total} эп.</span>}
              {title.is_ongoing && <span>Онгоинг</span>}
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
                  titleName={title.name.main}
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
          titleName={title.name.main}
        />
      )}
    </main>
  )
}
