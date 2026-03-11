import { fetchAniUpdates, fetchAniPopular } from '@/lib/anilibria'
import AniCarouselSection from '@/components/home/AniCarouselSection'

export default async function AnimePage() {
  const [updates, popular] = await Promise.all([
    fetchAniUpdates(20, 0),
    fetchAniPopular(20, 0),
  ])

  return (
    <main className="min-h-screen pt-20">
      <AniCarouselSection
        title="Новые серии"
        items={updates}
        viewAllHref="/anime/updates"
      />
      <AniCarouselSection
        title="Популярное аниме"
        items={popular}
        viewAllHref="/anime/popular"
      />
    </main>
  )
}
