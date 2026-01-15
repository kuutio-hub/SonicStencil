import React, { createContext, useState, useContext, useCallback } from 'react';
import type { Language } from '../types.ts';
import { locales } from '../i18n/locales.ts';

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('hu');

  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    let translation = locales[language][key] || key;
    if (replacements) {
      for (const rKey in replacements) {
        translation = translation.replace(new RegExp(`\\{${rKey}\\}`, 'g'), String(replacements[rKey]));
      }
    }
    return translation;
  }, [language]);

  const value = { language, setLanguage, t };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LanguageProvider');
  }
  return context;
};