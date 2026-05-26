"use client"

import { Fragment, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Sparkles, Search } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"

interface HeroSectionProps {
  freelancerCount: number
  serviceCount: number
}

const CHIPS = [
  { fr: "Développement web",  ar: "تطوير الويب",    href: "/services?group=programmation-tech"  },
  { fr: "Design graphique",   ar: "الجرافيك",        href: "/services?group=graphics-design"     },
  { fr: "Marketing digital",  ar: "التسويق الرقمي",  href: "/services?group=marketing-digital"   },
  { fr: "Montage vidéo",      ar: "مونتاج الفيديو",  href: "/services?group=video-animation"     },
  { fr: "Rédaction",          ar: "الكتابة",         href: "/services?group=redaction-traduction" },
]

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    if (target === 0) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) { setCount(target); return }

    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          observer.disconnect()
          const t0 = performance.now()
          const tick = (now: number) => {
            const progress = Math.min((now - t0) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(eased * target))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return { count, containerRef }
}

function StatNumber({ value, label }: { value: number; label: string }) {
  const { count, containerRef } = useCountUp(value)
  return (
    <div ref={containerRef} className="text-center">
      <div className="text-2xl font-black text-white tabular-nums leading-none">
        {count.toLocaleString()}
      </div>
      <div className="text-sm text-white/70 mt-1">{label}</div>
    </div>
  )
}

export function HeroSection({ freelancerCount, serviceCount }: HeroSectionProps) {
  const { lang } = useLanguage()
  const t = translations[lang].hero
  const headline1Words = t.headline1.split(" ")

  return (
    <section className="hero-gradient-animate relative flex flex-col items-center justify-center min-h-[85vh] pt-20 pb-20 overflow-hidden">

      {/* ── Zellige pattern ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ opacity: 0.05 }}
      >
        <defs>
          <pattern id="zellige-hero" x="0" y="0" width="56" height="56" patternUnits="userSpaceOnUse">
            <path
              d="M28,10 L30.9,21.1 L40.7,15.3 L34.9,25.1 L46,28 L34.9,30.9 L40.7,40.7 L30.9,34.9 L28,46 L25.1,34.9 L15.3,40.7 L21.1,30.9 L10,28 L21.1,25.1 L15.3,15.3 L25.1,21.1 Z"
              fill="none" stroke="white" strokeWidth="0.7"
            />
            <circle cx="28" cy="28" r="1.2" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#zellige-hero)" />
      </svg>

      {/* ── Content — strict vertical flow ── */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">

        {/* 1. Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/25 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-white shrink-0" aria-hidden="true" />
          <span className="text-[11px] font-bold tracking-widest text-white uppercase">{t.badge}</span>
        </div>

        {/* 2. H1 — word-by-word slide-up */}
        <h1 className="text-5xl sm:text-7xl font-black text-white leading-tight tracking-tight mt-6">
          {headline1Words.map((word, i) => (
            <Fragment key={i}>
              <span className="hero-word" style={{ animationDelay: `${i * 150}ms` }}>
                {word}
              </span>
              {i < headline1Words.length - 1 && " "}
            </Fragment>
          ))}
          {" "}
          <span
            className="hero-word relative inline-block"
            style={{ animationDelay: `${headline1Words.length * 150}ms` }}
          >
            {t.headline2}
            <svg
              className="absolute -bottom-1.5 start-0 w-full h-3 text-white/35"
              viewBox="0 0 200 12"
              fill="none"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M2 10C50 2 150 2 198 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </span>
        </h1>

        {/* 3. Subtitle */}
        <p className="text-base sm:text-lg text-white/80 mt-4 max-w-xl leading-relaxed">
          {t.subtext}
        </p>

        {/* 4. Search bar */}
        <form action="/services" method="get" className="mt-8 w-full max-w-2xl">
          <div className="hero-search-wrapper flex bg-white rounded-2xl shadow-xl overflow-hidden">
            <input
              type="text"
              name="q"
              placeholder={lang === "ar" ? "ابحث عن خدمة أو مهارة..." : "Rechercher un service, une compétence..."}
              className="flex-1 px-6 py-4 text-base text-gray-800 placeholder:text-gray-400 outline-none bg-transparent min-w-0"
            />
            <button
              type="submit"
              aria-label={lang === "ar" ? "بحث" : "Rechercher"}
              className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold px-8 transition-colors shrink-0"
            >
              <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{lang === "ar" ? "بحث" : "Rechercher"}</span>
            </button>
          </div>
        </form>

        {/* Sentinel for navbar IntersectionObserver */}
        <div id="hero-search-sentinel" aria-hidden="true" />

        {/* 5. Stats — viewport-triggered count-up */}
        {(freelancerCount > 0 || serviceCount > 0) && (
          <div className="mt-8 flex items-center gap-8 justify-center">
            {freelancerCount > 0 && (
              <StatNumber value={freelancerCount} label={t.freelancesLabel} />
            )}
            {freelancerCount > 0 && serviceCount > 0 && (
              <div className="w-px h-8 bg-white/20" aria-hidden="true" />
            )}
            {serviceCount > 0 && (
              <StatNumber value={serviceCount} label={t.servicesLabel} />
            )}
          </div>
        )}

        {/* 6. Category pills — staggered fade-in-up */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {CHIPS.map((chip, i) => (
            <Link
              key={chip.href}
              href={chip.href}
              className="hero-pill bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-full px-4 py-2 text-sm font-medium transition-colors"
              style={{ animationDelay: `${i * 75}ms` }}
            >
              {lang === "ar" ? chip.ar : chip.fr}
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
