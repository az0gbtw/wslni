"use client"

import { Users, Grid3X3 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { CountUp } from "@/components/count-up"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

interface TrustBannerSectionProps {
  freelancerCount: number
  serviceCount: number
}

export function TrustBannerSection({ freelancerCount, serviceCount }: TrustBannerSectionProps) {
  const { lang } = useLanguage()
  const t = translations[lang].trust
  const sectionRef = useScrollReveal(0.1)

  const stats = [
    { icon: Users, to: freelancerCount, suffix: "", label: t.freelances },
    { icon: Grid3X3, to: serviceCount, suffix: "", label: t.categories },
  ]

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="relative py-20 md:py-28 bg-primary text-primary-foreground overflow-hidden"
    >
      {/* Subtle zellige overlay on trust banner */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
          <defs>
            <pattern id="zellige-trust" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M24 2 L46 24 L24 46 L2 24 Z" fill="none" stroke="white" strokeWidth="0.5" />
              <circle cx="24" cy="24" r="1.5" fill="white" />
              <circle cx="0" cy="0" r="0.8" fill="white" />
              <circle cx="48" cy="0" r="0.8" fill="white" />
              <circle cx="0" cy="48" r="0.8" fill="white" />
              <circle cx="48" cy="48" r="0.8" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#zellige-trust)" opacity="0.06" />
        </svg>
        {/* Gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/15 via-transparent to-black/10" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 max-w-2xl mx-auto gap-8 md:gap-24">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="reveal flex flex-col items-center text-center group"
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                <div className="mb-4 p-4 rounded-2xl bg-white/10 group-hover:bg-white/20 transition-colors duration-300 shadow-inner">
                  <Icon className="w-7 h-7 md:w-8 md:h-8" />
                </div>
                <div className="font-display font-black text-3xl md:text-4xl mb-1.5">
                  <CountUp to={stat.to} suffix={stat.suffix} duration={1200} />
                </div>
                <div className="text-sm md:text-base text-primary-foreground/75 font-medium">
                  {stat.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
