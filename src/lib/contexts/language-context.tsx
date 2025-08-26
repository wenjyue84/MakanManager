import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language, useTranslation, languageCodes } from '../i18n';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  languageNames: Record<Language, string>;
  languageCodes: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export function LanguageProvider({ children, defaultLanguage = 'en' }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('preferredLanguage') as Language;
      if (saved && (languageCodes as Language[]).includes(saved)) {
        return saved;
      }
    }
    return defaultLanguage;
  });
  const { t, languageNames } = useTranslation(currentLanguage);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('preferredLanguage', language);
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    languageNames,
    languageCodes,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
