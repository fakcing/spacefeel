import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
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

async function HeroSection() {
  const r = await fetchTrending('movie')
  const movies = r.results.slice(0, 5) as Movie[]
  return <HeroBanner movies={movies} />
}

async function TrendingMoviesCarousel({ title }: { title: string }) {
  const r = await fetchTrending('movie')
  return <CarouselSection title={title} items={r.results.slice(0, 20) as Movie[]} mediaType="movie" viewAllHref="/movies?category=trending" />
}

async function PopularTVCarousel({ title }: { title: string }) {
  const r = await fetchPopular('tv')
  return <CarouselSection title={title} items={r.results.slice(0, 20) as TVShow[]} mediaType="tv" viewAllHref="/tv?category=popular" />
}

async function TopRatedMoviesCarousel({ title }: { title: string }) {
  const r = await fetchTopRated('movie')
  return <CarouselSection title={title} items={r.results.slice(0, 20) as Movie[]} mediaType="movie" viewAllHref="/movies?category=top_rated" />
}

async function TrendingAnimeCarousel({ title }: { title: string }) {
  const r = await fetchAnime('trending')
  return <CarouselSection title={title} items={r.results.slice(0, 20) as TVShow[]} mediaType="tv" viewAllHref="/anime?category=trending" />
}

async function AiringTodayCarousel({ title }: { title: string }) {
  const r = await fetchAiringToday()
  return <CarouselSection title={title} items={r.results.slice(0, 20) as TVShow[]} mediaType="tv" viewAllHref="/tv?category=airing_today" />
}

async function TopRatedAnimeCarousel({ title }: { title: string }) {
  const r = await fetchAnime('top_rated')
  return <CarouselSection title={title} items={r.results.slice(0, 20) as TVShow[]} mediaType="tv" viewAllHref="/anime?category=top_rated" />
}

async function FamilyCartoonsCarousel({ title }: { title: string }) {
  const r = await fetchCartoons('family')
  return <CarouselSection title={title} items={r.results.slice(0, 20) as TVShow[]} mediaType="tv" viewAllHref="/cartoons?category=family" />
}

export default async function HomePage() {
  const t = await getTranslations('home')

  return (
    <div>
      <Suspense fallback={<div className="w-full h-[75vh] shimmer" />}>
        <HeroSection />
      </Suspense>
      <div className="pt-8 space-y-2">
        <Suspense fallback={<CarouselSkeleton />}>
          <TrendingMoviesCarousel title={t('trendingMovies')} />
        </Suspense>
        <Suspense fallback={<CarouselSkeleton />}>
          <PopularTVCarousel title={t('popularTVShows')} />
        </Suspense>
        <Suspense fallback={<CarouselSkeleton />}>
          <TopRatedMoviesCarousel title={t('topRatedMovies')} />
        </Suspense>
        <Suspense fallback={<CarouselSkeleton />}>
          <TrendingAnimeCarousel title={t('trendingAnime')} />
        </Suspense>
        <Suspense fallback={<CarouselSkeleton />}>
          <AiringTodayCarousel title={t('airingToday')} />
        </Suspense>
        <Suspense fallback={<CarouselSkeleton />}>
          <TopRatedAnimeCarousel title={t('topRatedAnime')} />
        </Suspense>
        <Suspense fallback={<CarouselSkeleton />}>
          <FamilyCartoonsCarousel title={t('familyCartoons')} />
        </Suspense>
      </div>
    </div>
  )
}
