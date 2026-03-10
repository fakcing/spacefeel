import Link from 'next/link'
import { Github } from 'lucide-react'

const links = [
  { href: '/', label: 'Home' },
  { href: '/movies', label: 'Movies' },
  { href: '/tv', label: 'TV Shows' },
  { href: '/anime', label: 'Anime' },
  { href: '/cartoons', label: 'Cartoons' },
  { href: '/watchlist', label: 'Watchlist' },
]

export default function Footer() {
  return (
    <footer className="bg-[var(--bg-surface)] border-t border-[var(--border)] py-10 mt-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Nav links */}
        <nav className="flex flex-wrap gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-6 pt-6 flex items-center justify-between">
          <p className="text-xs text-white/30">© 2025 SpaceFeel. All rights reserved.</p>
          <a
            href="https://github.com/fakcing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-white transition-colors"
            aria-label="GitHub"
          >
            <Github size={18} />
          </a>
        </div>
      </div>
    </footer>
  )
}
