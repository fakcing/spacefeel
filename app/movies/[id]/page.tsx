import { notFound } from 'next/navigation'
import { fetchMovieDetail, fetchCredits, fetchVideos, fetchSimilar } from '@/lib/tmdb'
import DetailHero from '@/components/detail/DetailHero'
import CastRow from '@/components/detail/CastRow'
import TrailerModal from '@/components/detail/TrailerModal'
import SimilarSection from '@/components/detail/SimilarSection'
import { Movie } from '@/types/tmdb'

export const dynamic = 'force-dynamic'

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
      <div className="min-h-screen">
        <DetailHero item={movie} mediaType="movie" />
        <div className="max-w-7xl mx-auto">
          <div className="px-4 md:px-12 py-8 grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold tracking-tight mb-3 text-[var(--text-primary)]">Overview</h2>
              <p className="text-[var(--text-muted)] leading-relaxed">{movie.overview}</p>
            </div>
            {trailer && (
              <div>
                <h2 className="text-xl font-semibold tracking-tight mb-3 text-[var(--text-primary)]">Trailer</h2>
                <TrailerModal video={trailer} />
              </div>
            )}
          </div>
          {credits.cast.length > 0 && <CastRow cast={credits.cast} />}
          <SimilarSection items={similar.results as Movie[]} mediaType="movie" />
        </div>
      </div>
    )
  } catch {
    notFound()
  }
}
