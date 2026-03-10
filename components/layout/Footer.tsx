import Link from 'next/link'
import { Github } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function Footer() {
  const t = await getTranslations('nav')
  const tf = await getTranslations('footer')

  const links = [
    { href: '/', label: t('home') },
    { href: '/movies', label: t('movies') },
    { href: '/tv', label: t('tvShows') },
    { href: '/anime', label: t('anime') },
    { href: '/cartoons', label: t('cartoons') },
    { href: '/watchlist', label: t('watchlist') },
  ]

  return (
    <footer className="border-t py-10 mt-12" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Nav links */}
        <nav className="flex flex-wrap gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm transition-colors footer-link"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Bottom bar */}
        <div className="border-t mt-6 pt-6 flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>{tf('rights')}</p>
          <a
            href="https://github.com/fakcing"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors"
            style={{ color: 'var(--color-text-subtle)' }}
            aria-label="GitHub"
          >
            <Github size={18} />
          </a>
        </div>
      </div>
    </footer>
  )
}
