import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merges Tailwind class names, resolving conflicts via tailwind-merge. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a numeric price for display.
 * Arabic uses Arabic-Indic numerals (e.g. ١٥٠٠); French uses Moroccan locale separators.
 */
export function formatPrice(amount: number, lang: "fr" | "ar"): string {
  if (lang === "ar") return amount.toLocaleString("ar-u-nu-arab")
  return amount.toLocaleString("fr-MA")
}

/**
 * Formats an ISO timestamp string as a localised date.
 * Defaults to day/month/year; pass options to override.
 */
export function formatDate(
  ts: string,
  lang: "fr" | "ar",
  options?: Intl.DateTimeFormatOptions
): string {
  const defaults: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  }
  return new Date(ts).toLocaleDateString(
    lang === "ar" ? "ar-MA-u-nu-arab" : "fr-FR",
    options ?? defaults
  )
}
