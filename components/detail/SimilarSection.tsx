import { Movie, TVShow } from '@/types/tmdb'
import CarouselSection from '@/components/home/CarouselSection'

interface SimilarSectionProps {
  items: (Movie | TVShow)[]
  mediaType: 'movie' | 'tv'
}

export default function SimilarSection({ items, mediaType }: SimilarSectionProps) {
  if (!items.length) return null
  return <CarouselSection title="More Like This" items={items} mediaType={mediaType} />
}
