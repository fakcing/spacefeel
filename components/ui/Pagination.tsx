'use client'

import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseHref: string
  onPageChange?: (page: number) => void
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

export default function Pagination({ currentPage, totalPages, baseHref, onPageChange }: PaginationProps) {
  // TMDB caps at 500 pages
  const capped = Math.min(totalPages, 500)
  if (capped <= 1) return null

  const pages = getPageList(currentPage, capped)
  const btn = 'flex items-center justify-center w-9 h-9 rounded-full text-sm font-medium transition-colors'
  const separator = baseHref.includes('?') ? '&' : '?'

  const renderPage = (page: number | '...', i: number) => {
    if (page === '...') {
      return (
        <span key={`ellipsis-${i}`} className="text-gray-900/30 dark:text-white/30 w-9 text-center text-sm select-none">
          ...
        </span>
      )
    }
    const active = page === currentPage
    const className = `${btn} ${active
      ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
      : 'bg-black/[0.08] dark:bg-white/[0.08] hover:bg-black/[0.15] dark:hover:bg-white/[0.15] text-gray-900/70 dark:text-white/70'
    }`
    if (onPageChange) {
      return <button key={page} onClick={() => onPageChange(page)} className={className}>{page}</button>
    }
    return <Link key={page} href={`${baseHref}${separator}page=${page}`} className={className}>{page}</Link>
  }

  const nextClassName = 'flex items-center justify-center h-9 px-4 rounded-full text-sm font-medium bg-black/[0.08] dark:bg-white/[0.08] hover:bg-black/[0.15] dark:hover:bg-white/[0.15] text-gray-900/70 dark:text-white/70 transition-colors'

  return (
    <div className="flex items-center justify-center gap-1.5 py-10 flex-wrap">
      {pages.map((page, i) => renderPage(page, i))}
      {currentPage < capped && (
        onPageChange
          ? <button onClick={() => onPageChange(currentPage + 1)} className={nextClassName}>Next ›</button>
          : <Link href={`${baseHref}${separator}page=${currentPage + 1}`} className={nextClassName}>Next ›</Link>
      )}
    </div>
  )
}
