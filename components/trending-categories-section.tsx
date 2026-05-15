"use client"

import Link from "next/link"
import {
  Palette, Code2, TrendingUp, Video, PenTool,
  Music, Briefcase, GraduationCap, Sparkles,
} from "lucide-react"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { getCategoryLabel, getGroupForCategory, CATEGORY_GROUPS, GROUP_PILL_COLORS } from "@/lib/categories"

/* ─── Types ─────────────────────────────────────────────────── */
export interface TrendingCategory {
  category: string
  group: string | null
  count: number
}

interface Props {
  categories: TrendingCategory[]
}

/* ─── Icon map ──────────────────────────────────────────────── */
const GROUP_ICONS = [
  Palette, Code2, TrendingUp, Video, PenTool,
  Music, Briefcase, GraduationCap, Sparkles,
]

/* ─── Component ─────────────────────────────────────────────── */
export function TrendingCategoriesSection({ categories }: Props) {
  const sectionRef = useScrollReveal(0.05)

  if (categories.length === 0) return null

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-12 bg-background border-b border-border"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="reveal mb-8" style={{ transitionDelay: "0ms" }}>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-foreground">
            Tendances sur Wslni
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Les catégories les plus actives en ce moment
          </p>
        </div>

        {/* Pills */}
        <div className="flex flex-wrap gap-3">
          {categories.map((item, index) => {
            const groupValue  = item.group ?? getGroupForCategory(item.category) ?? ""
            const groupIdx    = CATEGORY_GROUPS.findIndex((g) => g.value === groupValue)
            const Icon        = GROUP_ICONS[groupIdx] ?? Palette
            const colors      = GROUP_PILL_COLORS[groupValue] ?? {
              pill: "bg-gray-50 text-gray-700 border-gray-200",
              count: "bg-gray-100 text-gray-600",
            }
            const label = getCategoryLabel(item.category)

            return (
              <Link
                key={item.category}
                href={`/services?category=${item.category}`}
                className={`reveal inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border text-sm font-medium transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${colors.pill}`}
                style={{ transitionDelay: `${(index + 1) * 80}ms` }}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" />
                <span>{label}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${colors.count}`}>
                  {item.count} {item.count > 1 ? "services" : "service"}
                </span>
              </Link>
            )
          })}
        </div>

      </div>
    </section>
  )
}
