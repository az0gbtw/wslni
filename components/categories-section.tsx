"use client"

import { 
  Palette, 
  Video, 
  Music, 
  Code, 
  Share2, 
  Camera, 
  Languages, 
  GraduationCap,
  TrendingUp,
  Scale,
  Mic,
  Box,
  PenTool,
  ClipboardList,
  PartyPopper,
  Shirt
} from "lucide-react"

const categories = [
  { icon: Palette, label: "Graphic Design & Branding", color: "bg-rose-50 text-rose-600 hover:bg-rose-100" },
  { icon: Video, label: "Video Editing & Motion", color: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
  { icon: Music, label: "Music Production & Mixing", color: "bg-purple-50 text-purple-600 hover:bg-purple-100" },
  { icon: Code, label: "Web & App Development", color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" },
  { icon: Share2, label: "Social Media Management", color: "bg-pink-50 text-pink-600 hover:bg-pink-100" },
  { icon: Camera, label: "Photography & Retouching", color: "bg-amber-50 text-amber-600 hover:bg-amber-100" },
  { icon: Languages, label: "Translation (AR/FR/EN)", color: "bg-cyan-50 text-cyan-600 hover:bg-cyan-100" },
  { icon: GraduationCap, label: "Tutoring & Academic Help", color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" },
  { icon: TrendingUp, label: "Financial Consulting", color: "bg-green-50 text-green-600 hover:bg-green-100" },
  { icon: Scale, label: "Legal & Administrative Help", color: "bg-slate-50 text-slate-600 hover:bg-slate-100" },
  { icon: Mic, label: "Voice Over & Podcast", color: "bg-orange-50 text-orange-600 hover:bg-orange-100" },
  { icon: Box, label: "3D & Animation", color: "bg-violet-50 text-violet-600 hover:bg-violet-100" },
  { icon: PenTool, label: "Content Writing & Copywriting", color: "bg-teal-50 text-teal-600 hover:bg-teal-100" },
  { icon: ClipboardList, label: "Data Entry & Virtual Assistant", color: "bg-sky-50 text-sky-600 hover:bg-sky-100" },
  { icon: PartyPopper, label: "Event Planning", color: "bg-fuchsia-50 text-fuchsia-600 hover:bg-fuchsia-100" },
  { icon: Shirt, label: "Fashion & Textile Design", color: "bg-red-50 text-red-600 hover:bg-red-100" },
]

export function CategoriesSection() {
  return (
    <section className="py-12 md:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-14">
          <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-3 text-balance">
            Explore nos catégories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Plus de 50 catégories de services pour répondre à tous tes besoins professionnels
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-4">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <button
                key={index}
                className={`group relative flex flex-col items-center justify-center p-4 md:p-6 rounded-xl ${category.color} border border-transparent hover:border-current/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer`}
              >
                <div className="mb-3 p-3 rounded-lg bg-white/60 group-hover:bg-white/80 transition-colors">
                  <Icon className="w-6 h-6 md:w-7 md:h-7 transition-transform duration-200 group-hover:scale-110" />
                </div>
                <span className="text-xs md:text-sm font-medium text-center leading-tight text-foreground/90">
                  {category.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* View All Link */}
        <div className="text-center mt-10">
          <button className="inline-flex items-center gap-2 text-primary font-medium hover:underline underline-offset-4 transition-all">
            Voir toutes les catégories
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
