export const LOCALE_TO_TMDB: Record<string, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  uk: 'uk-UA',
  de: 'de-DE',
  fr: 'fr-FR',
  ja: 'ja-JP',
  ko: 'ko-KR',
  es: 'es-ES',
}

export const getTmdbLanguage = (locale: string): string =>
  LOCALE_TO_TMDB[locale] ?? 'en-US'
