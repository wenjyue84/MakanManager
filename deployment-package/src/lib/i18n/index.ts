import { en } from './translations/en';
import { id } from './translations/id';
import { vi } from './translations/vi';
import { my } from './translations/my';

export type Language = 'en' | 'id' | 'vi' | 'my';

export const translations = {
  en,
  id,
  vi,
  my,
};

export const languageNames = {
  en: 'English',
  id: 'Bahasa Indonesia',
  vi: 'Tiếng Việt',
  my: 'မြန်မာဘာသာ',
};

export const languageCodes = Object.keys(translations) as Language[];

export function getTranslation(language: Language) {
  return translations[language] || translations.en;
}

export function t(language: Language, key: keyof typeof en): string {
  const translation = getTranslation(language);
  return translation[key] || key;
}

// Hook for using translations in components
export function useTranslation(language: Language) {
  return {
    t: (key: keyof typeof en) => t(language, key),
    language,
    languageNames,
    languageCodes,
  };
}
