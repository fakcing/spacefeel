import { Suspense, cache } from 'react'
import { getTranslations } from 'next-intl/server'
import { fetchYaniCatalog } from '@/lib/yani'
import AniCard from '@/components/cards/AniCard'
import Pagination from '@/components/ui/Pagination'
import AnimeFilters from '@/components/anime/AnimeFilters'

const getAnimeCatalog = cache(async (
  page: number,
  year: string,
  type: string,
  q: string,
) => {
  return await fetchYaniCatalog(page, 20, year, type, q)
})

export default async function AnimePage({
  searchParams,
}: {
  searchParams: { page?: string; year?: string; type?: string; q?: string }
}) {
  const page = Math.max(1, parseInt(searchParams.page || '1') || 1)
  const year = searchParams.year || ''
  const type = searchParams.type || ''
  const q = searchParams.q || ''

  const t = await getTranslations('pages.anime')
  const { items, hasMore } = await getAnimeCatalog(page, year, type, q)
  const totalPages = hasMore ? Math.max(page + 99, 200) : page

  const filterParams = new URLSearchParams()
  if (year) filterParams.set('year', year)
  if (type) filterParams.set('type', type)
  if (q) filterParams.set('q', q)
  const baseHref = `/anime${filterParams.toString() ? `?${filterParams.toString()}` : ''}`

  return (
    <div className="min-h-screen">
      <div className="relative pt-20 pb-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, var(--color-overlay) 0%, transparent 100%)' }} />
        <div className="relative px-4 md:px-8 max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '0.05em' }}>
            {t('title')}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('description')}</p>
        </div>
      </div>

      <div className="px-4 md:px-8 max-w-7xl mx-auto pb-24">
        <div className="mb-6">
          <Suspense>
            <AnimeFilters q={q} year={year} type={type} />
          </Suspense>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}></p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {items.map((item) => (
              <AniCard key={item.anime_id} item={item} />
            ))}
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} baseHref={baseHref} />
      </div>
    </div>
  )
}
