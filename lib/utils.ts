import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, lang: "fr" | "ar"): string {
  if (lang === "ar") return amount.toLocaleString("ar-u-nu-arab")
  return amount.toLocaleString("fr-MA")
}

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
