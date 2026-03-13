import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { fetchYaniTitle, fetchYaniVideos, fetchYaniCatalog } from '@/lib/yani'
import AniDetailHero from '@/components/anime/AniDetailHero'
import AniCard from '@/components/cards/AniCard'

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

  const t = await getTranslations('detail')

  const [videos, catalogResult] = await Promise.all([
    fetchYaniVideos(title.anime_id).catch(() => []),
    fetchYaniCatalog(1, 13).catch(() => ({ items: [], hasMore: false })),
  ])

  const similar = catalogResult.items.filter(a => a.anime_id !== title.anime_id).slice(0, 12)

  const dubbings = Array.from(new Set(videos.map(v => v.data.dubbing))).filter(Boolean)

  const ratings = [
    { label: 'MyAnimeList', value: title.rating.myanimelist_rating },
    { label: 'Shikimori',   value: title.rating.shikimori_rating },
    { label: 'KinoPoisk',   value: title.rating.kp_rating },
    { label: t('rating'),   value: title.rating.average },
  ].filter(r => r.value > 0)

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <AniDetailHero title={title} videos={videos} />

      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-20">

        {/* Description */}
        {title.description && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
              {t('overview')}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {title.description}
            </p>
          </section>
        )}

        {/* Details grid */}
        <section className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
            {[
              { label: t('year'),     value: title.year ? String(title.year) : null },
              { label: t('type'),     value: title.type?.name },
              { label: t('episodes'), value: title.episodes?.count > 0 ? String(title.episodes.count) : title.episodes?.aired > 0 ? String(title.episodes.aired) : null },
              { label: t('status'),   value: title.anime_status?.title },
              { label: 'Возраст',     value: title.min_age?.title },
            ].filter(i => i.value).map(item => (
              <div key={item.label}>
                <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-subtle)' }}>{item.label}</p>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Ratings */}
        {ratings.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
              {t('rating')}
            </h2>
            <div className="flex flex-wrap gap-3">
              {ratings.map(r => (
                <div
                  key={r.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl"
                  style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                >
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                    {r.value.toFixed(1)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{r.label}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Dubbing */}
        {dubbings.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
              {t('dubbing')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {dubbings.map(dub => (
                <span
                  key={dub}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                >
                  {dub}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Similar */}
        {similar.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              {t('moreLikeThis')}
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {similar.map(item => (
                <AniCard key={item.anime_id} item={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
