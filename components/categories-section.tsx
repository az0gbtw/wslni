"use client"

import Link from "next/link"
import { Palette, Code2, TrendingUp, Video, PenTool, Music, Briefcase, GraduationCap, Sparkles } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { CATEGORY_GROUPS } from "@/lib/categories"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

const GROUP_ICONS = [Palette, Code2, TrendingUp, Video, PenTool, Music, Briefcase, GraduationCap, Sparkles]

const GROUP_COLORS = [
  "from-rose-50 to-pink-100/70 text-rose-700",
  "from-emerald-50 to-teal-100/70 text-emerald-700",
  "from-blue-50 to-indigo-100/70 text-blue-700",
  "from-violet-50 to-purple-100/70 text-violet-700",
  "from-cyan-50 to-sky-100/70 text-cyan-700",
  "from-purple-50 to-fuchsia-100/70 text-purple-700",
  "from-green-50 to-emerald-100/70 text-green-700",
  "from-indigo-50 to-blue-100/70 text-indigo-700",
  "from-amber-50 to-yellow-100/70 text-amber-700",
]

export function CategoriesSection() {
  const { lang } = useLanguage()
  const t = translations[lang].categories
  const sectionRef = useScrollReveal(0.05)

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-20 md:py-32 bg-background"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-16 reveal" style={{ transitionDelay: "0ms" }}>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-foreground mb-4 text-balance leading-tight">
            {t.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {t.subtitle}
          </p>
        </div>

        {/* Categories Grid — 3×3 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-5">
          {CATEGORY_GROUPS.map((group, index) => {
            const Icon = GROUP_ICONS[index]
            const color = GROUP_COLORS[index]
            const label = t.items[index]
            return (
              <Link
                key={group.value}
                href={`/services?group=${group.value}`}
                className={`reveal category-card-hover group relative flex flex-col items-center justify-center p-5 md:p-8 rounded-2xl bg-gradient-to-br ${color} border border-current/10 hover:border-current/25 hover:shadow-lg hover:shadow-current/10 cursor-pointer`}
                style={{ transitionDelay: `${(index + 1) * 70}ms` }}
              >
                <div className="mb-4 p-3.5 rounded-xl bg-white/70 group-hover:bg-white/90 shadow-sm transition-all duration-200 group-hover:shadow-md">
                  <Icon className="w-6 h-6 md:w-7 md:h-7 transition-transform duration-200 group-hover:scale-110" />
                </div>
                <span className="font-display font-bold text-sm md:text-base text-center leading-tight text-foreground/80 group-hover:text-foreground transition-colors">
                  {label}
                </span>
              </Link>
            )
          })}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12 reveal" style={{ transitionDelay: "720ms" }}>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline underline-offset-4 transition-all text-base"
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
