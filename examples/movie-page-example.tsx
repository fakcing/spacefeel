// Example: Movie detail page with parsed player
// app/movies/[id]/page.tsx

import { notFound } from 'next/navigation'
import { cache } from 'react'
import { fetchMovieDetail } from '@/lib/tmdb'
import ParsedPlayer from '@/components/detail/ParsedPlayer'

const getMovie = cache(async (id: number) => {
  try {
    return await fetchMovieDetail(id)
  } catch {
    return null
  }
})

export default async function MovieDetailPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const movie = await getMovie(id)
  if (!movie) notFound()

  return (
    <div className="min-h-screen pt-20 pb-20">
      {/* Hero section with backdrop */}
      {movie.backdrop_path && (
        <div className="relative w-full h-[50vh] sm:h-[65vh]">
          {/* Backdrop image would go here */}
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-32 relative z-10">
        {/* Player Section */}
        <div className="bg-[var(--color-surface)] rounded-xl overflow-hidden shadow-2xl mb-8">
          <ParsedPlayer tmdbId={id} type="movie" />
        </div>

        {/* Movie Info */}
        <div className="px-4 py-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{movie.title}</h1>
          <p className="text-[var(--color-text-muted)] mb-4">{movie.overview}</p>
        </div>
      </div>
    </div>
  )
}
