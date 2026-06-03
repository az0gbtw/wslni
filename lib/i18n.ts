"use client"

import { translations } from "./translations"
import { useLanguage } from "./language-context"

export { translations }
export type { Lang } from "./translations"

/**
 * Returns the current translation object, active language, and language setters.
 * Shorthand for the common pattern of reading translations[lang] inside a Client Component.
 */
export function useTranslation() {
  const { lang, setLang, toggleLang } = useLanguage()
  const t = translations[lang]
  return { t, lang, setLang, toggleLang }
}
