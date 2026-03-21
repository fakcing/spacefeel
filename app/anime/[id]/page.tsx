import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { fetchYaniTitle, fetchYaniVideos, fetchYaniCatalog } from '@/lib/yani'
import AniDetailHero from '@/components/anime/AniDetailHero'
import AniDetailTabs from '@/components/anime/AniDetailTabs'
import AniCard from '@/components/cards/AniCard'
import UserRating from '@/components/ui/UserRating'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props) {
  try {
    const title = await fetchYaniTitle(params.id)
    return {
      title: `${title.title} — spacefeel`,
      description: title.description || undefined,
      openGraph: {
        title: title.title,
        description: title.description || undefined,
        images: title.poster?.big ? [title.poster.big] : [],
      },
    }
  } catch {
    return { title: 'spacefeel' }
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

  return (
    <main className="min-h-screen pb-20">
      <AniDetailHero title={title} videos={videos} />

      <div className="max-w-7xl mx-auto">
        {/* Tabs: Overview + Details */}
        <div className="px-4 md:px-12 py-6 md:py-8">
          <AniDetailTabs title={title} />
        </div>

        {/* Community ratings */}
        <div className="px-4 md:px-12 pb-6 md:pb-8">
          <UserRating tmdbId={title.anime_id} mediaType="anime" />
        </div>

        {/* Similar anime */}
        {similar.length > 0 && (
          <div className="px-4 md:px-12 pb-8">
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              {t('moreLikeThis')}
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {similar.map(item => (
                <AniCard key={item.anime_id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
