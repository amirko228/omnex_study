import type { Locale } from './config';
import { en } from './locales/en';
import { ru } from './locales/ru';
import { de } from './locales/de';
import { es } from './locales/es';
import { fr } from './locales/fr';

const dictionaries = {
  en,
  ru,
  de,
  es,
  fr,
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale] || dictionaries.en;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Dictionary = Record<string, any>;
