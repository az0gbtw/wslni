"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { createClient } from "@/lib/supabase/client"
import { CountUp } from "@/components/count-up"

function ZelligePattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute -end-20 top-20 w-96 h-96 opacity-10 animate-float"
        viewBox="0 0 200 200"
        fill="none"
      >
        <path
          d="M100 0L117.32 50L170.71 50L127.69 80.9L145.04 130.9L100 100L54.96 130.9L72.31 80.9L29.29 50L82.68 50L100 0Z"
          fill="currentColor"
          className="text-primary"
        />
      </svg>
      <svg
        className="absolute start-10 bottom-10 w-64 h-64 opacity-8"
        viewBox="0 0 100 100"
        fill="none"
        style={{ animationDelay: "1s" }}
      >
        <rect
          x="10"
          y="10"
          width="80"
          height="80"
          rx="4"
          fill="currentColor"
          className="text-secondary"
          transform="rotate(45 50 50)"
        />
      </svg>
      <div className="absolute end-1/4 top-1/3 w-3 h-3 bg-primary/20 rotate-45 animate-pulse-subtle" />
      <div className="absolute start-1/3 top-1/4 w-2 h-2 bg-primary/30 rotate-45" style={{ animationDelay: "0.5s" }} />
      <div className="absolute end-1/3 bottom-1/4 w-4 h-4 border-2 border-primary/20 rotate-45" />
      <div className="absolute top-0 start-0 w-full h-32 bg-gradient-to-b from-secondary/50 to-transparent" />
      <div className="absolute bottom-0 start-0 w-full h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  )
}

export function HeroSection() {
  const { lang } = useLanguage()
  const t = translations[lang].hero
  const router = useRouter()

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
    <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary/30 pt-16">
      <ZelligePattern />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in-up"
            style={{ animationDelay: "0ms" }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {t.badge}
            </span>
          </div>

          {/* Main Headline */}
          <h1
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-5 sm:mb-6 text-balance animate-fade-in-up"
            style={{ animationDelay: "160ms" }}
          >
            {t.headline1}{" "}
            <span className="text-primary relative">
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
            <span className="text-muted-foreground">{t.headline3}</span>
          </h1>

          {/* Subtext */}
          <p
            className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 text-pretty animate-fade-in-up"
            style={{ animationDelay: "310ms" }}
          >
            {t.subtext}
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
            style={{ animationDelay: "460ms" }}
          >
            <Button
              size="lg"
              className="w-full sm:w-auto text-base px-8 py-4 sm:py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300 group"
              onClick={() => router.push("/services")}
            >
              {t.ctaFind}
              <ArrowRight className="ms-2 h-5 w-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-base px-8 py-4 sm:py-6 border-2 border-foreground/20 hover:border-primary hover:text-primary hover:scale-[1.02] transition-all duration-300"
              onClick={handleOfferServices}
            >
              {t.ctaOffer}
            </Button>
          </div>

          {/* Stats row with count-up */}
          <div
            className="mt-8 sm:mt-14 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground animate-fade-in-up"
            style={{ animationDelay: "620ms" }}
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2 rtl:space-x-reverse">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-primary border-2 border-background flex items-center justify-center text-xs font-medium text-primary-foreground"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span>
                +<CountUp to={12000} duration={1800} />
                {" "}{t.freelancesLabel}
              </span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-border" />
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-amber-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span>
                <CountUp to={4.9} decimals={1} duration={1600} />/5
                {" "}{t.satisfactionLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
