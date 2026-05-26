"use client"

import Link from "next/link"
import { Palette, Code2, TrendingUp, Video, PenTool, Music, Briefcase, GraduationCap, Sparkles } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { CATEGORY_GROUPS, GROUP_GRADIENTS } from "@/lib/categories"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

const GROUP_ICONS = [Palette, Code2, TrendingUp, Video, PenTool, Music, Briefcase, GraduationCap, Sparkles]

export function CategoriesSection() {
  const { lang } = useLanguage()
  const t = translations[lang].categories
  const sectionRef = useScrollReveal(0.05)

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-20 md:py-28 bg-secondary/40"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-10 md:mb-14 reveal" style={{ transitionDelay: "0ms" }}>
          <h2 className="font-display font-black text-4xl md:text-5xl text-foreground tracking-tight mb-3 leading-tight">
            {t.title}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">{t.subtitle}</p>
        </div>

        {/* 3×3 category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
          {CATEGORY_GROUPS.map((group, index) => {
            const Icon   = GROUP_ICONS[index]
            const grad   = GROUP_GRADIENTS[group.value] ?? { bg: "from-gray-50 to-gray-100", icon: "text-gray-500" }
            const label  = lang === "ar" ? group.arLabel : t.items[index]
            const count  = group.subcategories.length
            const suffix = lang === "ar" ? "خدمة" : "services"
            return (
              <Link
                key={group.value}
                href={`/services?group=${group.value}`}
                className={`reveal category-card-hover group relative flex flex-col items-start p-5 md:p-6 rounded-2xl bg-gradient-to-br ${grad.bg} border border-transparent hover:border-current/10 shadow-sm hover:shadow-xl hover:shadow-black/10 cursor-pointer gap-4 overflow-hidden`}
                style={{ transitionDelay: `${(index + 1) * 55}ms` }}
              >
                {/* Icon container — white pill with colored icon */}
                <div className="flex items-center justify-center rounded-xl bg-white shadow-sm group-hover:shadow-md transition-shadow duration-200 p-3">
                  <Icon className={`w-7 h-7 ${grad.icon} transition-transform duration-200 group-hover:scale-110`} />
                </div>

                {/* Text */}
                <div className="flex-1">
                  <p className="font-bold text-sm md:text-base text-foreground leading-snug">{label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{count} {suffix}</p>
                </div>

                {/* Hover arrow */}
                <svg
                  className={`absolute bottom-4 end-4 w-4 h-4 opacity-0 group-hover:opacity-60 transition-opacity duration-200 ${grad.icon} rtl:rotate-180`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )
          })}
        </div>

        {/* View all link */}
        <div className="text-center mt-8 reveal" style={{ transitionDelay: "600ms" }}>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline underline-offset-4 transition-all text-sm md:text-base"
          >
            {t.viewAll}
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
