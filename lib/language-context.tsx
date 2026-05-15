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

  function setLang(l: Lang) { setLangState(l) }
  function toggleLang() { setLangState((p) => (p === "fr" ? "ar" : "fr")) }

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
