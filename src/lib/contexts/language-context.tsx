import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language, useTranslation } from '../i18n';

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
  const [currentLanguage, setCurrentLanguage] = useState<Language>(defaultLanguage);
  const { t, languageNames, languageCodes } = useTranslation(currentLanguage);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    // Optionally save to localStorage for persistence
    localStorage.setItem('preferredLanguage', language);
  };

  // Load saved language preference on mount
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage') as Language;
    if (savedLanguage && languageCodes.includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, [languageCodes]);

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
