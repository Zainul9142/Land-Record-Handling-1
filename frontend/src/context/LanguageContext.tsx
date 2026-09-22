import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, translations, LanguageInfo } from '../i18n/translations';

interface LanguageContextType {
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  t: (key: string, fallback?: string) => string;
  currentLangInfo: LanguageInfo;
  languages: LanguageInfo[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('bhoomi_lang');
    if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
      return saved as SupportedLanguage;
    }
    return 'en';
  });

  const setLang = (newLang: SupportedLanguage) => {
    setLangState(newLang);
    localStorage.setItem('bhoomi_lang', newLang);
  };

  const t = (key: string, fallback?: string): string => {
    const currentDict = translations[lang] || translations.en;
    if (currentDict && currentDict[key]) {
      return currentDict[key];
    }
    // Fallback to English dictionary
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    return fallback || key;
  };

  const currentLangInfo = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t,
        currentLangInfo,
        languages: SUPPORTED_LANGUAGES
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
