import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['en', 'ru', 'uk', 'de', 'fr', 'ja', 'ko', 'es'],
  defaultLocale: 'en',
  localePrefix: 'never',
  localeDetection: false,
})

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
