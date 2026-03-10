import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseHref: string
}

function getPageList(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total]
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  }

  return [1, '...', current - 1, current, current + 1, '...', total]
}

export default function Pagination({ currentPage, totalPages, baseHref }: PaginationProps) {
  // TMDB caps at 500 pages
  const capped = Math.min(totalPages, 500)
  if (capped <= 1) return null

  const pages = getPageList(currentPage, capped)
  const btn = 'flex items-center justify-center w-9 h-9 rounded-full text-sm font-medium transition-colors'

  return (
    <div className="flex items-center justify-center gap-1.5 py-10 flex-wrap">
      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="text-white/30 w-9 text-center text-sm select-none">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={`${baseHref}&page=${page}`}
            className={`${btn} ${
              page === currentPage
                ? 'bg-white text-black'
                : 'bg-white/[0.08] hover:bg-white/[0.15] text-white/70'
            }`}
          >
            {page}
          </Link>
        )
      )}

      {currentPage < capped && (
        <Link
          href={`${baseHref}&page=${currentPage + 1}`}
          className="flex items-center justify-center h-9 px-4 rounded-full text-sm font-medium bg-white/[0.08] hover:bg-white/[0.15] text-white/70 transition-colors"
        >
          Next ›
        </Link>
      )}
    </div>
  )
}
