import { cache } from 'react'
import { fetchYaniCatalog } from '@/lib/yani'
import AniCard from '@/components/cards/AniCard'
import Pagination from '@/components/ui/Pagination'
import AnimeFilters from '@/components/anime/AnimeFilters'

const getAnimeCatalog = cache(async (
  page: number,
  year: string,
  type: string,
  sort: string,
  q: string,
  season: string,
  genre: string,
) => {
  return await fetchYaniCatalog(page, 20, year, type, sort, q, season, genre)
})

export default async function AnimePage({
  searchParams,
}: {
  searchParams: { page?: string; year?: string; type?: string; sort?: string; q?: string; season?: string; genre?: string }
}) {
  const page = Math.max(1, parseInt(searchParams.page || '1') || 1)
  const year = searchParams.year || ''
  const type = searchParams.type || ''
  const sort = searchParams.sort || ''
  const q = searchParams.q || ''
  const season = searchParams.season || ''
  const genre = searchParams.genre || ''

  const { items, hasMore } = await getAnimeCatalog(page, year, type, sort, q, season, genre)
  const totalPages = hasMore ? page + 10 : page

  const filterParams = new URLSearchParams()
  if (year) filterParams.set('year', year)
  if (type) filterParams.set('type', type)
  if (sort) filterParams.set('sort', sort)
  if (q) filterParams.set('q', q)
  if (season) filterParams.set('season', season)
  if (genre) filterParams.set('genre', genre)
  const baseHref = `/anime${filterParams.toString() ? `?${filterParams.toString()}` : ''}`

  return (
    <div className="min-h-screen pt-14 pb-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
      <div className="mb-6 md:mb-8 pt-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-1">Аниме</h1>
        <p className="text-sm text-gray-900/50 dark:text-white/50 max-w-xl">
          Открывай и исследуй огромную коллекцию аниме-сериалов и фильмов. От популярных хитов до скрытых жемчужин.
        </p>
      </div>

      <div className="mb-6">
        <AnimeFilters q={q} year={year} type={type} sort={sort} season={season} genre={genre} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {items.map((item) => (
          <AniCard key={item.anime_id} item={item} />
        ))}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} baseHref={baseHref} />
    </div>
  )
}
