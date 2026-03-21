import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchMovieDetail, fetchCredits, fetchVideos, fetchSimilar } from '@/lib/tmdb'
import DetailHero from '@/components/detail/DetailHero'
import DetailTabs from '@/components/detail/DetailTabs'
import TrailerModal from '@/components/detail/TrailerModal'
import SimilarSection from '@/components/detail/SimilarSection'
import { Movie } from '@/types/tmdb'
import UserRating from '@/components/ui/UserRating'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const id = parseInt(params.id)
  if (isNaN(id)) return { title: 'spacefeel' }
  try {
    const movie = await fetchMovieDetail(id)
    return {
      title: `${movie.title} — spacefeel`,
      description: movie.overview || undefined,
      openGraph: {
        title: movie.title,
        description: movie.overview || undefined,
        images: movie.poster_path ? [`https://image.tmdb.org/t/p/w780${movie.poster_path}`] : [],
      },
    }
  } catch {
    return { title: 'spacefeel' }
  }
}

export default async function MovieDetailPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  try {
    const [movie, credits, videos, similar] = await Promise.all([
      fetchMovieDetail(id),
      fetchCredits('movie', id),
      fetchVideos('movie', id),
      fetchSimilar('movie', id),
    ])

    const trailer = videos.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer') || videos.results[0]

    return (
      <div className="min-h-screen pb-20">
        <DetailHero item={movie} mediaType="movie" />
        <div className="max-w-7xl mx-auto">
          <div className="px-4 md:px-12 py-6 md:py-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="md:col-span-2">
              <DetailTabs item={movie} cast={credits.cast} />
            </div>
            {trailer && (
              <div>
                <h2 className="text-lg md:text-xl font-semibold tracking-tight mb-3 text-[var(--text-primary)]">Trailer</h2>
                <TrailerModal video={trailer} />
              </div>
            )}
          </div>
          <div className="px-4 md:px-12 pb-6 md:pb-8">
            <UserRating tmdbId={id} mediaType="movie" />
          </div>
          <SimilarSection items={similar.results as Movie[]} mediaType="movie" />
        </div>
      </div>
    )
  } catch {
    notFound()
  }
}
