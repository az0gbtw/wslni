"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export type Lang = "fr" | "ar"

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "fr",
  setLang: () => {},
  toggleLang: () => {},
})

/**
 * Provides language state (FR/AR) to the component tree.
 * Reads the preference from localStorage on mount and writes it back on change.
 * Also writes a `lang` cookie so middleware and Server Components can read the preference
 * without relying on localStorage (which is client-only).
 * Initial state "fr" is intentional — it matches the server-rendered default so hydration
 * doesn't produce a mismatch before the localStorage read completes.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr")

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null
    if (saved === "fr" || saved === "ar") setLangState(saved)
  }, [])

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
    document.documentElement.lang = lang
    localStorage.setItem("lang", lang)
    document.cookie = `lang=${lang}; path=/; max-age=31536000; SameSite=Lax`
  }, [lang])

  /** Sets the active language and persists it to localStorage and the lang cookie. */
  function setLang(l: Lang) { setLangState(l) }

  /** Toggles between French and Arabic. */
  function toggleLang() { setLangState((p) => (p === "fr" ? "ar" : "fr")) }

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

/** Returns the current language and setters from the nearest LanguageProvider. */
export function useLanguage() {
  return useContext(LanguageContext)
}
