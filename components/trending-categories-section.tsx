"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { getCategoryLabel } from "@/lib/categories"

export interface TrendingCategory {
  category: string
  group: string | null
  count: number
}

interface Props {
  categories: TrendingCategory[]
}

export function TrendingCategoriesSection({ categories }: Props) {
  const { lang } = useLanguage()
  const sectionRef = useScrollReveal(0.05)

  if (categories.length === 0) return null

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-12 bg-secondary/40"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="reveal mb-6" style={{ transitionDelay: "0ms" }}>
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-foreground">
            {lang === "ar" ? "ما هو معروض الآن" : "Déjà des services dans"}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {categories.map((item, index) => {
            const label = getCategoryLabel(item.category, lang)
            const noun = lang === "ar" ? "خدمة" : item.count > 1 ? "services" : "service"
            return (
              <Link
                key={item.category}
                href={`/services?category=${item.category}`}
                className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-background text-sm font-medium text-foreground hover:border-primary/40 transition-colors"
                style={{ transitionDelay: `${(index + 1) * 60}ms` }}
              >
                <span>{label}</span>
                <span className="text-xs text-muted-foreground">{item.count} {noun}</span>
              </Link>
            )
          })}
        </div>

      </div>
    </section>
  )
}
