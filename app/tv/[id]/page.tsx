import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchTVDetail, fetchCredits, fetchVideos, fetchSimilar } from '@/lib/tmdb'
import { getWatchProgress } from '@/lib/watchProgress'
import DetailHero from '@/components/detail/DetailHero'
import DetailTabs from '@/components/detail/DetailTabs'
import TrailerModal from '@/components/detail/TrailerModal'
import SimilarSection from '@/components/detail/SimilarSection'
import { TVShow } from '@/types/tmdb'
import UserRating from '@/components/ui/UserRating'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const id = parseInt(params.id)
  if (isNaN(id)) return { title: 'spacefeel' }
  try {
    const show = await fetchTVDetail(id)
    return {
      title: `${show.name} — spacefeel`,
      description: show.overview || undefined,
      openGraph: {
        title: show.name,
        description: show.overview || undefined,
        images: show.poster_path ? [`https://image.tmdb.org/t/p/w780${show.poster_path}`] : [],
      },
    }
  } catch {
    return { title: 'spacefeel' }
  }
}

export default async function TVDetailPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  try {
    const [show, credits, videos, similar, progress] = await Promise.all([
      fetchTVDetail(id),
      fetchCredits('tv', id),
      fetchVideos('tv', id),
      fetchSimilar('tv', id),
      getWatchProgress(id, 'tv'),
    ])

    const trailer = videos.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer') || videos.results[0]

    return (
      <div className="min-h-screen">
        <DetailHero item={show} mediaType="tv" progress={progress} />
        <div className="max-w-7xl mx-auto">
          <div className="px-4 md:px-12 py-8 grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <DetailTabs item={show} cast={credits.cast} />
            </div>
            {trailer && (
              <div>
                <h2 className="text-xl font-semibold tracking-tight mb-3 text-[var(--text-primary)]">Trailer</h2>
                <TrailerModal video={trailer} />
              </div>
            )}
          </div>
          <div className="px-4 md:px-12 pb-8">
            <UserRating tmdbId={id} mediaType="tv" />
          </div>
          <SimilarSection items={similar.results as TVShow[]} mediaType="tv" />
        </div>
      </div>
    )
  } catch {
    notFound()
  }
}
