import { notFound } from 'next/navigation'
import Image from 'next/image'
import { fetchYaniTitle, fetchYaniVideos, getPosterUrl } from '@/lib/yani'
import AniPlayerButton from '@/components/anime/AniPlayerButton'
import AniEpisodesGrid from '@/components/anime/AniEpisodesGrid'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props) {
  try {
    const title = await fetchYaniTitle(params.id)
    return { title: `${title.title} — SpaceFeel` }
  } catch {
    return { title: 'SpaceFeel' }
  }
}

export default async function AniDetailPage({ params }: Props) {
  let title
  try {
    title = await fetchYaniTitle(params.id)
  } catch {
    notFound()
  }

  const videos = await fetchYaniVideos(title.anime_id).catch(() => [])
  const poster = getPosterUrl(title.poster.big || title.poster.medium)

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
              alt={title.title}
              priority
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1
              className="text-4xl font-black tracking-tight"
              style={{ color: 'var(--color-text)' }}
            >
              {title.title}
            </h1>

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
                  {g.title}
                </span>
              ))}
            </div>

            {/* Meta */}
            <div
              className="flex gap-6 mt-4 text-sm flex-wrap"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <span>{title.year}</span>
              <span>{title.type?.name}</span>
              {title.episodes?.count > 0 && <span>{title.episodes.count} эп.</span>}
              {title.anime_status && <span>{title.anime_status.title}</span>}
              {title.rating.average > 0 && <span>★ {title.rating.average.toFixed(1)}</span>}
            </div>

            {/* Description */}
            <p
              className="mt-4 text-sm leading-relaxed line-clamp-4"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {title.description}
            </p>

            {/* Play button */}
            {videos.length > 0 && (
              <div className="flex gap-3 mt-6">
                <AniPlayerButton videos={videos} titleName={title.title} shikimoriId={title.anime_id} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Episodes grid */}
      {videos.length > 0 && (
        <AniEpisodesGrid videos={videos} titleName={title.title} shikimoriId={title.anime_id} />
      )}
    </main>
  )
}
