"use client"

import Link from "next/link"
import {
  Palette, Video, Music, Code, Share2, Camera, Languages, GraduationCap,
  TrendingUp, Scale, Mic, Box, PenTool, ClipboardList, PartyPopper, Shirt
} from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { CATEGORIES } from "@/lib/categories"

const categoryIcons = [
  Palette, Video, Music, Code, Share2, Camera, Languages, GraduationCap,
  TrendingUp, Scale, Mic, Box, PenTool, ClipboardList, PartyPopper, Shirt,
]

const categoryColors = [
  "bg-rose-50 text-rose-600 hover:bg-rose-100",
  "bg-blue-50 text-blue-600 hover:bg-blue-100",
  "bg-purple-50 text-purple-600 hover:bg-purple-100",
  "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
  "bg-pink-50 text-pink-600 hover:bg-pink-100",
  "bg-amber-50 text-amber-600 hover:bg-amber-100",
  "bg-cyan-50 text-cyan-600 hover:bg-cyan-100",
  "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
  "bg-green-50 text-green-600 hover:bg-green-100",
  "bg-slate-50 text-slate-600 hover:bg-slate-100",
  "bg-orange-50 text-orange-600 hover:bg-orange-100",
  "bg-violet-50 text-violet-600 hover:bg-violet-100",
  "bg-teal-50 text-teal-600 hover:bg-teal-100",
  "bg-sky-50 text-sky-600 hover:bg-sky-100",
  "bg-fuchsia-50 text-fuchsia-600 hover:bg-fuchsia-100",
  "bg-red-50 text-red-600 hover:bg-red-100",
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

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-4">
          {t.items.map((label, index) => {
            const Icon = categoryIcons[index]
            const color = categoryColors[index]
            const categoryId = CATEGORIES[index]?.value
            return (
              <Link
                key={index}
                href={`/services?category=${categoryId}`}
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
