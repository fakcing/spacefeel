import { Suspense, cache } from 'react'
import { getTranslations } from 'next-intl/server'
import HeroBanner from '@/components/home/HeroBanner'
import CarouselSection from '@/components/home/CarouselSection'
import {
  fetchTrending, fetchPopular, fetchTopRated,
  fetchAiringToday, fetchCartoons
} from '@/lib/tmdb'
import { Movie, TVShow } from '@/types/tmdb'

function HeroBannerSkeleton() {
  return (
    <div className="relative w-full h-[75vh] bg-black/[0.05] dark:bg-white/[0.05]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 rounded-full border-4 border-black/10 dark:border-white/10 border-t-black/40 dark:border-t-white/40 animate-spin" />
      </div>
    </div>
  )
}

// Cache home data at component level
const getCachedHomeData = cache(async () => {
  const [trendingMovies, popularTV, topRatedMovies, airingToday, popularCartoons] = await Promise.all([
    fetchTrending('movie'),
    fetchPopular('tv'),
    fetchTopRated('movie'),
    fetchAiringToday(),
    fetchCartoons('popular'),
  ])
  return { trendingMovies, popularTV, topRatedMovies, airingToday, popularCartoons }
})

async function HomePageContent() {
  const t = await getTranslations('home')
  const data = await getCachedHomeData()

  return (
    <div>
      <HeroBanner movies={data.trendingMovies.results.slice(0, 5) as Movie[]} />
      <div className="pt-6 sm:pt-8 space-y-4 sm:space-y-2 px-2 sm:px-0">
        <CarouselSection title={t('trendingMovies')} items={data.trendingMovies.results.slice(0, 20) as Movie[]} mediaType="movie" viewAllHref="/movies?category=trending" />
        <CarouselSection title={t('popularTVShows')} items={data.popularTV.results.slice(0, 20) as TVShow[]} mediaType="tv" viewAllHref="/tv?category=popular" />
        <CarouselSection title={t('topRatedMovies')} items={data.topRatedMovies.results.slice(0, 20) as Movie[]} mediaType="movie" viewAllHref="/movies?category=top_rated" />
        <CarouselSection title={t('airingToday')} items={data.airingToday.results.slice(0, 20) as TVShow[]} mediaType="tv" viewAllHref="/tv?category=airing_today" />
        <CarouselSection title={t('popularCartoons')} items={data.popularCartoons.results.slice(0, 20) as TVShow[]} mediaType="tv" viewAllHref="/cartoons?category=popular" />
      </div>
    </div>
  )
}

export default async function HomePage() {
  return (
    <Suspense fallback={<HeroBannerSkeleton />}>
      <HomePageContent />
    </Suspense>
  )
}
