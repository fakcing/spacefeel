import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function NotFound() {
  const t = await getTranslations('notFound')
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="text-[120px] md:text-[180px] font-bold leading-none bg-gradient-to-b from-[var(--color-text)] to-transparent bg-clip-text text-transparent select-none">
        404
      </div>
      <h2 className="text-xl font-semibold mt-4 mb-2" style={{ color: 'var(--color-text)' }}>{t('title')}</h2>
      <p className="text-sm mb-8 max-w-sm" style={{ color: 'var(--color-text-muted)' }}>
        {t('subtitle')}
      </p>
      <Link
        href="/"
        className="bg-gray-900 dark:bg-white text-white dark:text-black font-semibold rounded-full px-8 py-3 hover:bg-gray-800 dark:hover:bg-white/90 transition-colors"
      >
        {t('back')}
      </Link>
    </div>
  )
}
