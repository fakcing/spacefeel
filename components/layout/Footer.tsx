import Link from 'next/link'
import { Github } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function Footer() {
  const t = await getTranslations('nav')
  const tf = await getTranslations('footer')

  const links = [
    { href: '/',         label: t('home') },
    { href: '/movies',   label: t('movies') },
    { href: '/tv',       label: t('tvShows') },
    { href: '/cartoons', label: t('cartoons') },
    { href: '/anime',    label: t('anime') },
    { href: '/watchlist', label: t('watchlist') },
  ]

  return (
    <footer className="border-t mt-16 md:block hidden" style={{ borderColor: 'var(--color-border)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex items-start justify-between gap-8">
          <div>
            <span
              className="text-xl tracking-[0.15em] font-bold mb-4 block"
              style={{ fontFamily: 'var(--font-bebas), sans-serif', color: 'var(--color-text)' }}
            >
              SPACEFEEL
            </span>
            <nav className="flex flex-wrap gap-x-5 gap-y-2">
              {links.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm transition-colors footer-link"
                  style={{ color: 'var(--color-text-subtle)' }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <a
            href="https://github.com/fakcing"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-60 mt-1 flex-shrink-0"
            style={{ color: 'var(--color-text-subtle)' }}
            aria-label="GitHub"
          >
            <Github size={17} />
          </a>
        </div>
        <div className="border-t mt-8 pt-6" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>{tf('rights')}</p>
        </div>
      </div>
    </footer>
  )
}
