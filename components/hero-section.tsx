"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"

export interface TopFreelancer {
  id: string
  full_name: string | null
  avatar_url: string | null
  job_title: string | null
}

export interface WheelRating {
  freelancer_id: string
  rating: number
}

interface HeroSectionProps {
  freelancerCount: number
  serviceCount: number
  topFreelancers: TopFreelancer[]
  wheelRatings: WheelRating[]
}

const CHIPS = [
  { fr: "Développement web",  ar: "تطوير الويب",    href: "/services?group=programmation-tech"  },
  { fr: "Design graphique",   ar: "الجرافيك",        href: "/services?group=graphics-design"     },
  { fr: "Marketing digital",  ar: "التسويق الرقمي",  href: "/services?group=marketing-digital"   },
  { fr: "Montage vidéo",      ar: "مونتاج الفيديو",  href: "/services?group=video-animation"     },
  { fr: "Rédaction",          ar: "الكتابة",         href: "/services?group=redaction-traduction" },
]

// Radius (px) of the avatar orbit track
const WHEEL_RADIUS = 160

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
    <div ref={containerRef}>
      <div className="text-3xl font-black text-white tabular-nums leading-none">
        {count.toLocaleString()}
      </div>
      <div className="text-xs text-white/80 mt-1">{label}</div>
    </div>
  )
}

function getInitials(name: string | null) {
  if (!name) return "?"
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

function getFirstName(name: string | null) {
  if (!name) return "?"
  return name.split(" ")[0]
}

function buildAvgRatingMap(ratings: WheelRating[]) {
  const totals: Record<string, { sum: number; count: number }> = {}
  for (const r of ratings) {
    if (!totals[r.freelancer_id]) totals[r.freelancer_id] = { sum: 0, count: 0 }
    totals[r.freelancer_id].sum += r.rating
    totals[r.freelancer_id].count += 1
  }
  const avg: Record<string, number> = {}
  for (const id in totals) avg[id] = totals[id].sum / totals[id].count
  return avg
}

function RatingStar({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#FBBF24" className={`${className} shrink-0`} aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

// Clock-position marker dots on the outer ring (12, 3, 6, 9 o'clock)
const RING_MARKERS = [
  "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
  "top-1/2 right-0 translate-x-1/2 -translate-y-1/2",
  "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
  "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2",
]

function FreelancerWheel({ freelancers, ratings }: { freelancers: TopFreelancer[]; ratings: WheelRating[] }) {
  const avgRatings = buildAvgRatingMap(ratings)
  const step = 360 / Math.max(freelancers.length, 1)

  return (
    <div className="hidden lg:flex w-[420px] h-[420px] items-center justify-center mx-auto">
      <div className="relative w-[380px] h-[380px]">

        {/* Soft glow behind the whole wheel */}
        <div
          className="absolute inset-0 rounded-full bg-radial from-white/5 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Rotating layer — rails, markers, connecting lines and avatars orbit together */}
        <div className="wheel-orbit absolute inset-0">
          {/* Outer rail */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/15 drop-shadow-[0_0_20px_rgba(255,255,255,0.08)]" />
          {/* Inner rail */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-white/8" />

          {/* Clock markers on the outer ring */}
          {RING_MARKERS.map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-1.5 h-1.5 rounded-full bg-white/30`} aria-hidden="true" />
          ))}

          {/* Thin spokes connecting the center to each avatar */}
          <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 380 380" aria-hidden="true">
            {freelancers.map((f, i) => {
              const angle = i * step
              const rad = (angle * Math.PI) / 180
              const x2 = 190 + WHEEL_RADIUS * Math.sin(rad)
              const y2 = 190 - WHEEL_RADIUS * Math.cos(rad)
              return (
                <line key={f.id} x1="190" y1="190" x2={x2} y2={y2} stroke="white" strokeOpacity="0.08" strokeWidth="1" />
              )
            })}
          </svg>

          {freelancers.map((f, i) => {
            const angle = i * step
            const avgRating = avgRatings[f.id]
            return (
              <div
                key={f.id}
                className="absolute top-1/2 left-1/2"
                style={{ transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${WHEEL_RADIUS}px)` }}
              >
                {/* Counter-rotates so the avatar + rating pill stay upright */}
                <div
                  className="wheel-counter-orbit flex flex-col items-center gap-1.5"
                  style={{ "--angle": `${angle}deg` } as React.CSSProperties}
                >
                  <div className="hover:scale-110 transition-transform duration-200">
                    {f.avatar_url ? (
                      <div className="relative w-14 h-14 rounded-full ring-2 ring-white shadow-xl shadow-black/20 overflow-hidden">
                        <Image
                          src={f.avatar_url}
                          alt={f.full_name ?? ""}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-white/20 ring-2 ring-white shadow-xl shadow-black/20 flex items-center justify-center text-white text-sm font-semibold">
                        {getInitials(f.full_name)}
                      </div>
                    )}
                  </div>
                  {/* Frosted-glass mini profile card */}
                  <span className="flex items-center gap-1 rounded-xl border border-white/30 bg-white/20 backdrop-blur-md px-2.5 py-1 shadow-md">
                    <span className="text-[10px] font-semibold text-white">{getFirstName(f.full_name)}</span>
                    {avgRating != null && (
                      <>
                        <RatingStar className="w-2.5 h-2.5" />
                        <span className="text-[10px] text-white/90">{avgRating.toFixed(1)}</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Center decoration — static, outside the rotating layer */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-full border border-white/30 bg-gradient-to-br from-white/20 to-white/5 shadow-lg backdrop-blur-sm">
          <RatingStar className="w-7 h-7 animate-pulse [animation-duration:3s]" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white">Tops</span>
        </div>

      </div>
    </div>
  )
}

export function HeroSection({ freelancerCount, serviceCount, topFreelancers, wheelRatings }: HeroSectionProps) {
  const { lang } = useLanguage()
  const t = translations[lang].hero

  return (
    <section className="relative bg-red-700 min-h-[80vh] flex items-center overflow-hidden px-6 sm:px-12 py-16">
      <div className="relative z-10 w-full max-w-7xl mx-auto lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">

        {/* ── LEFT COLUMN — copy, search, stats, pills ── */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-start">

          <p className="text-base sm:text-lg text-white/80 max-w-lg leading-relaxed">
            {t.subtext}
          </p>

          <form action="/services" method="get" className="mt-8 w-full max-w-2xl">
            <div className="hero-search-wrapper flex bg-white rounded-2xl overflow-hidden">
              <input
                type="text"
                name="q"
                placeholder={lang === "ar" ? "ابحث عن خدمة أو مهارة..." : "Rechercher un service, une compétence..."}
                className="flex-1 px-6 py-4 text-base text-gray-800 placeholder:text-gray-400 outline-none bg-transparent min-w-0"
              />
              <button
                type="submit"
                aria-label={lang === "ar" ? "بحث" : "Rechercher"}
                className="flex items-center gap-2 hero-search-btn text-white font-bold px-8 shrink-0"
              >
                <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">{lang === "ar" ? "بحث" : "Rechercher"}</span>
              </button>
            </div>
          </form>

          {/* Sentinel for navbar IntersectionObserver */}
          <div id="hero-search-sentinel" aria-hidden="true" />

          {(freelancerCount > 0 || serviceCount > 0) && (
            <div className="mt-8 flex items-center gap-8 justify-center lg:justify-start">
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

          <div className="mt-6 flex flex-wrap gap-2 justify-center lg:justify-start">
            {CHIPS.map((chip) => (
              <Link
                key={chip.href}
                href={chip.href}
                className="bg-white/15 hover:bg-white/25 text-white border border-white/25 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                {lang === "ar" ? chip.ar : chip.fr}
              </Link>
            ))}
          </div>
        </div>

        {/* ── RIGHT COLUMN — freelancer wheel, hidden on mobile ── */}
        <FreelancerWheel freelancers={topFreelancers} ratings={wheelRatings} />

      </div>
    </section>
  )
}
