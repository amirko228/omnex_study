export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'ru', 'de', 'es', 'fr'],
} as const;

export type Locale = (typeof i18n)['locales'][number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
};
