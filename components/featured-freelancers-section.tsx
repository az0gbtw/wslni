"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight, UserPlus } from "lucide-react"
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
  rating: number | null
  review_count: number
}

interface FeaturedFreelancersSectionProps {
  profiles: FeaturedProfile[]
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

function StarRating({ rating }: { rating: number }) {
  const filled = Math.round(rating)
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= filled ? "text-amber-400" : "text-muted-foreground/30"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export function FeaturedFreelancersSection({ profiles }: FeaturedFreelancersSectionProps) {
  const { lang } = useLanguage()
  const t = translations[lang].featured
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const sectionRef = useScrollReveal(0.08)

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

          {profiles.length > 0 && (
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
          )}
        </div>

        {profiles.length === 0 ? (
          <div className="reveal" style={{ transitionDelay: "80ms" }}>
            <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-border bg-secondary/30 px-6 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <p className="max-w-sm text-base text-muted-foreground">
                {t.emptyMessage}
              </p>
              <Button
                asChild
                className="rounded-full hover-spring"
              >
                <Link href="/inscription">{t.emptyAction}</Link>
              </Button>
            </div>
          </div>
        ) : (
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
                    {profile.rating != null ? (
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={profile.rating} />
                        <span className="text-xs text-muted-foreground">
                          {profile.rating.toFixed(1)} ({profile.review_count} {t.reviews})
                        </span>
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
        )}
      </div>
    </section>
  )
}
