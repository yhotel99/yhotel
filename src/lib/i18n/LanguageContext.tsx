"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { translations, Language } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (typeof translations)[Language];
  isHydrated: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const DEFAULT_LANGUAGE: Language = "vi";
const LANGUAGE_COOKIE_NAME = "language";
const LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

type LanguageProviderProps = {
  children: React.ReactNode;
  initialLanguage?: Language;
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children, initialLanguage = DEFAULT_LANGUAGE }) => {
  // Use server-provided language to guarantee SSR/client first render consistency.
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark hydration complete and keep persisted values in sync with SSR initial language.
    setIsHydrated(true);

    // Do not change language state here to avoid SSR/client text mismatch
    // on lazily hydrated sections. Server decides initial language via cookie.
    if (typeof window !== "undefined") {
      localStorage.setItem(LANGUAGE_COOKIE_NAME, initialLanguage);
      document.cookie = `${LANGUAGE_COOKIE_NAME}=${initialLanguage}; path=/; max-age=${LANGUAGE_COOKIE_MAX_AGE}; samesite=lax`;
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem(LANGUAGE_COOKIE_NAME, lang);
      document.cookie = `${LANGUAGE_COOKIE_NAME}=${lang}; path=/; max-age=${LANGUAGE_COOKIE_MAX_AGE}; samesite=lax`;
    }
  };

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: translations[language],
    isHydrated,
  }), [language, isHydrated]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
