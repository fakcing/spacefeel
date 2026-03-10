import { Suspense } from 'react'
import HeroBanner from '@/components/home/HeroBanner'
import CarouselSection from '@/components/home/CarouselSection'
import SkeletonCard from '@/components/ui/SkeletonCard'
import {
  fetchTrending, fetchPopular, fetchTopRated,
  fetchAiringToday, fetchAnime, fetchCartoons
} from '@/lib/tmdb'
import { Movie, TVShow } from '@/types/tmdb'

function CarouselSkeleton() {
  return (
    <section className="px-4 md:px-8 py-6">
      <div className="h-6 w-48 rounded shimmer mb-4" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="min-w-[160px] md:min-w-[180px] flex-shrink-0">
            <SkeletonCard />
          </div>
        ))}
      </div>
    </section>
  )
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [
    trendingMovies,
    popularTV,
    topRatedMovies,
    trendingAnime,
    airingToday,
    topRatedAnime,
    familyCartoons,
  ] = await Promise.all([
    fetchTrending('movie').then((r) => r.results.slice(0, 20) as Movie[]),
    fetchPopular('tv').then((r) => r.results.slice(0, 20) as TVShow[]),
    fetchTopRated('movie').then((r) => r.results.slice(0, 20) as Movie[]),
    fetchAnime('trending').then((r) => r.results.slice(0, 20) as TVShow[]),
    fetchAiringToday().then((r) => r.results.slice(0, 20) as TVShow[]),
    fetchAnime('top_rated').then((r) => r.results.slice(0, 20) as TVShow[]),
    fetchCartoons('family').then((r) => r.results.slice(0, 20) as TVShow[]),
  ])

  return (
    <div>
      <HeroBanner movies={trendingMovies.slice(0, 5)} />
      <div className="pt-8 space-y-2">
        <Suspense fallback={<CarouselSkeleton />}>
          <CarouselSection title="Trending Movies" items={trendingMovies} mediaType="movie" viewAllHref="/movies?category=trending" />
        </Suspense>
        <Suspense fallback={<CarouselSkeleton />}>
          <CarouselSection title="Popular TV Shows" items={popularTV} mediaType="tv" viewAllHref="/tv?category=popular" />
        </Suspense>
        <Suspense fallback={<CarouselSkeleton />}>
          <CarouselSection title="Top Rated Movies" items={topRatedMovies} mediaType="movie" viewAllHref="/movies?category=top_rated" />
        </Suspense>
        <Suspense fallback={<CarouselSkeleton />}>
          <CarouselSection title="Trending Anime" items={trendingAnime} mediaType="tv" viewAllHref="/anime?category=trending" />
        </Suspense>
        <Suspense fallback={<CarouselSkeleton />}>
          <CarouselSection title="Airing Today" items={airingToday} mediaType="tv" viewAllHref="/tv?category=airing_today" />
        </Suspense>
        <Suspense fallback={<CarouselSkeleton />}>
          <CarouselSection title="Top Rated Anime" items={topRatedAnime} mediaType="tv" viewAllHref="/anime?category=top_rated" />
        </Suspense>
        <Suspense fallback={<CarouselSkeleton />}>
          <CarouselSection title="Family Cartoons" items={familyCartoons} mediaType="tv" viewAllHref="/cartoons?category=family" />
        </Suspense>
      </div>
    </div>
  )
}
