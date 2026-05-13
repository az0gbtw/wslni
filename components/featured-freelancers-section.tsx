"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

const GRADIENTS = [
  "from-rose-400 to-pink-500",
  "from-blue-400 to-indigo-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
]

export interface FeaturedProfile {
  id: string
  full_name: string
  job_title: string
  avatar_url: string | null
  min_price: number | null
}

interface FeaturedFreelancersSectionProps {
  profiles: FeaturedProfile[]
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

export function FeaturedFreelancersSection({ profiles }: FeaturedFreelancersSectionProps) {
  const { lang } = useLanguage()
  const t = translations[lang].featured
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const sectionRef = useScrollReveal(0.08)

  if (profiles.length === 0) return null

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320
      const dir = lang === "ar" ? (direction === "left" ? 1 : -1) : (direction === "left" ? -1 : 1)
      scrollContainerRef.current.scrollBy({ left: dir * scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-20 md:py-32 bg-background overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12" style={{ transitionDelay: "0ms" }}>
          <div>
            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-foreground mb-2 text-balance leading-tight">
              {t.title}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t.subtitle}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              className="rounded-full border-border hover:border-primary hover:text-primary transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              className="rounded-full border-border hover:border-primary hover:text-primary transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-5 overflow-x-auto pt-4 pb-6 -mx-4 px-4 -mt-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {profiles.map((profile, index) => (
            <div
              key={profile.id}
              className="reveal flex-shrink-0 w-72 snap-start overflow-visible"
              style={{ transitionDelay: `${(index + 1) * 80}ms` }}
            >
              <div className="group relative bg-gradient-to-br from-card via-card to-secondary/40 rounded-2xl border border-border/60 p-6 shadow-sm hover:shadow-xl hover:shadow-primary/8 hover:border-primary/25 transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-visible">
                <div className="flex items-start gap-4 mb-5">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]} flex items-center justify-center text-white font-bold text-base shadow-lg overflow-hidden shrink-0`}>
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(profile.full_name)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{profile.full_name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{profile.job_title}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  {profile.min_price != null ? (
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">{t.from}</p>
                      <p className="text-xl font-black text-primary font-display">
                        {profile.min_price} <span className="text-sm font-normal text-muted-foreground">DH</span>
                      </p>
                    </div>
                  ) : (
                    <div />
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-primary/25 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary hover-spring rounded-full"
                    asChild
                  >
                    <Link href={`/profil/${profile.id}`}>
                      {t.viewProfile}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
