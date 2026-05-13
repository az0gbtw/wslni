"use client"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { createClient } from "@/lib/supabase/client"
import { CountUp } from "@/components/count-up"

export function HeroSection() {
  const { lang } = useLanguage()
  const t = translations[lang].hero
  const router = useRouter()
  const parallaxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (mq.matches) return
    function onScroll() {
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translateY(${window.scrollY * 0.22}px)`
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  async function handleOfferServices() {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      router.push("/dashboard")
    } else {
      router.push("/inscription?redirect=/dashboard")
    }
  }

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center bg-background overflow-hidden pt-16">

      {/* Zellige background pattern — parallax layer */}
      <div
        ref={parallaxRef}
        className="parallax-hero absolute pointer-events-none"
        aria-hidden="true"
        style={{ top: "-20%", bottom: "-20%", left: 0, right: 0 }}
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
          <defs>
            <pattern id="zellige-hero" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
              {/* Outer diamond */}
              <path d="M32 2 L62 32 L32 62 L2 32 Z" fill="none" stroke="#1A1A1A" strokeWidth="0.75" />
              {/* Inner rotated square */}
              <rect x="16" y="16" width="32" height="32" fill="none" stroke="#1A1A1A" strokeWidth="0.4" transform="rotate(45 32 32)" />
              {/* Center jewel */}
              <circle cx="32" cy="32" r="2" fill="#1A1A1A" />
              {/* Corner connectors */}
              <circle cx="0" cy="0" r="1.2" fill="#1A1A1A" />
              <circle cx="64" cy="0" r="1.2" fill="#1A1A1A" />
              <circle cx="0" cy="64" r="1.2" fill="#1A1A1A" />
              <circle cx="64" cy="64" r="1.2" fill="#1A1A1A" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#zellige-hero)" opacity="0.026" />
        </svg>
        {/* Atmospheric glow — top-end crimson */}
        <div className="absolute -top-32 -end-32 w-[600px] h-[600px] rounded-full bg-primary/6 blur-3xl" />
        {/* Atmospheric glow — bottom-start warm */}
        <div className="absolute -bottom-32 -start-32 w-[500px] h-[500px] rounded-full bg-amber-400/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-28">
        <div className="text-center max-w-4xl mx-auto">

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/8 border border-primary/15 mb-10 animate-fade-in-up"
            style={{ animationDelay: "0ms" }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold tracking-widest text-primary uppercase">
              {t.badge}
            </span>
          </div>

          {/* Main Headline — Playfair Display */}
          <h1
            className="font-display font-black text-[2.6rem] sm:text-[3.8rem] md:text-[5rem] lg:text-[5.8rem] leading-[1.06] tracking-tight text-foreground mb-7 text-balance animate-fade-in-up"
            style={{ animationDelay: "60ms", userSelect: "none", WebkitUserSelect: "none" }}
          >
            {t.headline1}{" "}
            <span className="text-primary relative inline-block">
              {t.headline2}
              <svg
                className="absolute -bottom-2 start-0 w-full h-3 text-primary/30"
                viewBox="0 0 200 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 10C50 2 150 2 198 10"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <br />
            <span className="text-foreground/35 text-[1.8rem] sm:text-[2.6rem] md:text-[3.2rem] lg:text-[3.8rem] font-bold tracking-wide">
              {t.headline3}
            </span>
          </h1>

          {/* Subtext */}
          <p
            className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-11 sm:mb-14 text-pretty leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "120ms" }}
          >
            {t.subtext}
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
            style={{ animationDelay: "180ms" }}
          >
            <Button
              size="lg"
              className="w-full sm:w-auto text-base px-9 h-14 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover-spring group font-semibold rounded-full"
              onClick={() => router.push("/services")}
            >
              {t.ctaFind}
              <ArrowRight className="ms-2 h-5 w-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-base px-9 h-14 border-2 border-foreground/15 hover:border-primary hover:text-primary hover:bg-primary/4 hover-spring font-semibold rounded-full"
              onClick={handleOfferServices}
            >
              {t.ctaOffer}
            </Button>
          </div>

          {/* Stats row */}
          <div
            className="mt-14 sm:mt-20 flex flex-wrap items-center justify-center gap-6 sm:gap-12 animate-fade-in-up"
            style={{ animationDelay: "240ms" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5 rtl:space-x-reverse">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/70 to-primary border-2 border-background flex items-center justify-center text-xs font-bold text-primary-foreground shadow-sm"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-start rtl:text-end">
                <div className="text-sm font-bold text-foreground">
                  +<CountUp to={12000} duration={1200} />
                </div>
                <div className="text-xs text-muted-foreground">{t.freelancesLabel}</div>
              </div>
            </div>

            <div className="hidden sm:block w-px h-10 bg-border" />

            <div className="flex items-center gap-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <div className="text-start rtl:text-end">
                <div className="text-sm font-bold text-foreground">
                  <CountUp to={4.9} decimals={1} duration={1200} />/5
                </div>
                <div className="text-xs text-muted-foreground">{t.satisfactionLabel}</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
