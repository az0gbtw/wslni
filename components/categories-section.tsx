"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { CATEGORY_GROUPS } from "@/lib/categories"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

export function CategoriesSection() {
  const { lang } = useLanguage()
  const t = translations[lang].categories
  const sectionRef = useScrollReveal(0.05)

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-16 md:py-24 bg-background"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mb-8 md:mb-10 reveal" style={{ transitionDelay: "0ms" }}>
          <h2 className="font-serif font-bold text-3xl md:text-4xl text-foreground tracking-tight leading-tight">
            {t.title}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base mt-2 max-w-lg">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
          {CATEGORY_GROUPS.map((group, index) => {
            const label  = lang === "ar" ? group.arLabel : t.items[index]
            const count  = group.subcategories.length
            const suffix = lang === "ar" ? "تخصصات" : "spécialités"
            return (
              <Link
                key={group.value}
                href={`/services?group=${group.value}`}
                className="reveal group flex flex-col justify-between gap-6 p-5 md:p-6 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors"
                style={{ transitionDelay: `${(index + 1) * 40}ms` }}
              >
                <p className="font-semibold text-base md:text-lg text-foreground leading-snug group-hover:text-primary transition-colors">
                  {label}
                </p>
                <p className="text-xs text-muted-foreground">{count} {suffix}</p>
              </Link>
            )
          })}
        </div>

        <div className="mt-8">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline underline-offset-4 text-sm md:text-base"
          >
            {t.viewAll}
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
