"use client"

import { translations } from "./translations"
import { useLanguage } from "./language-context"

export { translations }
export type { Lang } from "./translations"

export function useTranslation() {
  const { lang, setLang, toggleLang } = useLanguage()
  const t = translations[lang]
  return { t, lang, setLang, toggleLang }
}
