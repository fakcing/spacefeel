import { notFound } from 'next/navigation'
import Image from 'next/image'
import { fetchYaniTitle, fetchYaniVideos, getPosterUrl } from '@/lib/yani'
import AniPlayerButton from '@/components/anime/AniPlayerButton'

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

  // Unique dubbings/translators
  const dubbings = Array.from(new Set(videos.map((v) => v.data.dubbing))).filter(Boolean)

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Hero section */}
      <div className="relative w-full pt-24 pb-12 px-6">
        <div className="max-w-5xl mx-auto flex gap-8 flex-wrap sm:flex-nowrap">
          {/* Poster */}
          <div className="relative w-44 h-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl">
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

            {/* Meta grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 mt-5 text-sm">
              {[
                { label: 'Год', value: title.year },
                { label: 'Тип', value: title.type?.name },
                { label: 'Эпизоды', value: title.episodes?.count > 0 ? `${title.episodes.count} эп.` : title.episodes?.aired > 0 ? `${title.episodes.aired} эп.` : null },
                { label: 'Статус', value: title.anime_status?.title },
                { label: 'Возраст', value: title.min_age?.title },
                { label: 'Рейтинг', value: title.rating.average > 0 ? `★ ${title.rating.average.toFixed(1)}` : null },
                { label: 'MyAnimeList', value: title.rating.myanimelist_rating > 0 ? `★ ${title.rating.myanimelist_rating.toFixed(1)}` : null },
                { label: 'Shikimori', value: title.rating.shikimori_rating > 0 ? `★ ${title.rating.shikimori_rating.toFixed(1)}` : null },
                { label: 'KinoPoisk', value: title.rating.kp_rating > 0 ? `★ ${title.rating.kp_rating.toFixed(1)}` : null },
              ]
                .filter((item) => item.value)
                .map((item) => (
                  <div key={item.label}>
                    <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>{item.label}</span>
                    <p className="font-medium" style={{ color: 'var(--color-text)' }}>{item.value}</p>
                  </div>
                ))}
            </div>

            {/* Description */}
            <p
              className="mt-5 text-sm leading-relaxed line-clamp-4"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {title.description}
            </p>

            {/* Voice actors / translators */}
            {dubbings.length > 0 && (
              <div className="mt-4">
                <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>Озвучка</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {dubbings.map((dub) => (
                    <span
                      key={dub}
                      className="px-2 py-0.5 rounded text-xs"
                      style={{ backgroundColor: 'var(--color-overlay)', color: 'var(--color-text-muted)' }}
                    >
                      {dub}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Translators list from metadata */}
            {title.translates && title.translates.length > 0 && (
              <div className="mt-3">
                <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>Переводчики</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {title.translates.slice(0, 6).map((t) => (
                    <span
                      key={t.value}
                      className="px-2 py-0.5 rounded text-xs"
                      style={{ backgroundColor: 'var(--color-overlay)', color: 'var(--color-text-muted)' }}
                    >
                      {t.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Play button */}
            {videos.length > 0 && (
              <div className="flex gap-3 mt-6">
                <AniPlayerButton videos={videos} titleName={title.title} shikimoriId={title.anime_id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
