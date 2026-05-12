"use client"

import Link from "next/link"
import { Palette, Code2, TrendingUp, Video, PenTool, Music, Briefcase, GraduationCap, Sparkles } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { CATEGORY_GROUPS } from "@/lib/categories"

const GROUP_ICONS = [Palette, Code2, TrendingUp, Video, PenTool, Music, Briefcase, GraduationCap, Sparkles]

const GROUP_COLORS = [
  "bg-rose-50 text-rose-600 hover:bg-rose-100",
  "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
  "bg-blue-50 text-blue-600 hover:bg-blue-100",
  "bg-violet-50 text-violet-600 hover:bg-violet-100",
  "bg-cyan-50 text-cyan-600 hover:bg-cyan-100",
  "bg-purple-50 text-purple-600 hover:bg-purple-100",
  "bg-green-50 text-green-600 hover:bg-green-100",
  "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
  "bg-amber-50 text-amber-600 hover:bg-amber-100",
]

export function CategoriesSection() {
  const { lang } = useLanguage()
  const t = translations[lang].categories

  return (
    <section className="py-12 md:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-14">
          <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-3 text-balance">
            {t.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {t.subtitle}
          </p>
        </div>

        {/* Categories Grid — 3×3 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 md:gap-4">
          {CATEGORY_GROUPS.map((group, index) => {
            const Icon = GROUP_ICONS[index]
            const color = GROUP_COLORS[index]
            const label = t.items[index]
            return (
              <Link
                key={group.value}
                href={`/services?group=${group.value}`}
                className={`group relative flex flex-col items-center justify-center p-4 md:p-6 rounded-xl ${color} border border-transparent hover:border-current/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer`}
              >
                <div className="mb-3 p-3 rounded-lg bg-white/60 group-hover:bg-white/80 transition-colors">
                  <Icon className="w-6 h-6 md:w-7 md:h-7 transition-transform duration-200 group-hover:scale-110" />
                </div>
                <span className="text-xs md:text-sm font-medium text-center leading-tight text-foreground/90">
                  {label}
                </span>
              </Link>
            )
          })}
        </div>

        {/* View All Link */}
        <div className="text-center mt-10">
          <Link href="/services" className="inline-flex items-center gap-2 text-primary font-medium hover:underline underline-offset-4 transition-all">
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
