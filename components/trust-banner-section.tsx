"use client"

import Link from "next/link"
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
  const isEmpty = freelancerCount === 0 && serviceCount === 0

  const stats = [
    { to: freelancerCount, suffix: "", label: t.freelances },
    { to: serviceCount, suffix: "", label: t.categories },
  ]

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="relative py-20 md:py-32 bg-primary text-primary-foreground overflow-hidden"
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
        {isEmpty ? (
          /* Launch mode — no data yet */
          <div className="reveal text-center max-w-xl mx-auto" style={{ transitionDelay: "0ms" }}>
            <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl mb-6 leading-tight">
              {lang === "ar" ? "كن من بين الأوائل على وصلني" : "Soyez parmi les premiers sur Wslni"}
            </h2>
            <Link
              href="/inscription"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-primary font-bold text-sm hover:bg-white/90 transition-colors"
            >
              {lang === "ar" ? "إنشاء حساب مجاني" : "Créer un compte gratuit"}
            </Link>
          </div>
        ) : (
          /* Normal mode — show live stats */
          <div className="grid grid-cols-2 max-w-xl mx-auto gap-8 md:gap-20">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="reveal flex flex-col items-center text-center"
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                <div className="relative mb-3">
                  {/* Inner glow highlight */}
                  <div className="absolute inset-0 rounded-3xl bg-white/10 blur-2xl scale-125" aria-hidden="true" />
                  <div className="relative font-display font-black text-8xl md:text-9xl leading-none">
                    <CountUp to={stat.to} suffix={stat.suffix} duration={1200} />
                  </div>
                </div>
                <div className="text-xs md:text-sm text-primary-foreground/70 font-medium uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
