import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

const VALID_LOCALES = ['en', 'ru', 'uk', 'de', 'fr', 'ja', 'ko', 'es']

export default getRequestConfig(async () => {
  const cookieStore = cookies()
  const requested = cookieStore.get('locale')?.value ?? ''
  const locale = VALID_LOCALES.includes(requested) ? requested : 'en'
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
