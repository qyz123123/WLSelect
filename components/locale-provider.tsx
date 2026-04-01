"use client";

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { defaultLocale, t } from "@/lib/i18n";
import { Locale } from "@/lib/types";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  copy: ReturnType<typeof t>;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  initialLocale = defaultLocale,
  persistToAccount = false
}: {
  children: ReactNode;
  initialLocale?: Locale;
  persistToAccount?: boolean;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const storedLocale = window.localStorage.getItem("wlselect-locale") as Locale | null;
    if (!persistToAccount && (storedLocale === "en" || storedLocale === "zh")) {
      setLocaleState(storedLocale);
    }
  }, [persistToAccount]);

  const value = useMemo(
    () => ({
      locale,
      setLocale: async (nextLocale: Locale) => {
        setLocaleState(nextLocale);
        window.localStorage.setItem("wlselect-locale", nextLocale);
        if (persistToAccount) {
          await fetch("/api/preferences/language", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ locale: nextLocale })
          });
        }
      },
      copy: t(locale)
    }),
    [locale, persistToAccount]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used inside LocaleProvider");
  }

  return context;
}
