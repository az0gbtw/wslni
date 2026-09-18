"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

export interface FeaturedProfile {
  id: string
  full_name: string
  job_title: string
  avatar_url: string | null
  rating: number | null
  review_count: number
  min_price?: number | null
  cin_status?: string | null
  skills?: string[] | null
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
          className={`w-4 h-4 ${star <= filled ? "text-amber-400" : "text-muted-foreground/20"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
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
    if (!scrollContainerRef.current) return
    const amount = 340
    const dir = lang === "ar"
      ? direction === "left" ? 1 : -1
      : direction === "left" ? -1 : 1
    scrollContainerRef.current.scrollBy({ left: dir * amount, behavior: "smooth" })
  }

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-16 md:py-24 bg-secondary/40 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header row */}
        <div
          className="reveal flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
          style={{ transitionDelay: "0ms" }}
        >
          <div>
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-foreground tracking-tight leading-tight">
              {t.title}
            </h2>
          </div>

          {profiles.length > 0 && (
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("left")}
                className="rounded-full border-border hover:border-primary hover:text-primary transition-colors"
                aria-label="Précédent"
              >
                <ChevronLeft className="h-4 w-4 rtl:hidden" />
                <ChevronRight className="h-4 w-4 ltr:hidden" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("right")}
                className="rounded-full border-border hover:border-primary hover:text-primary transition-colors"
                aria-label="Suivant"
              >
                <ChevronRight className="h-4 w-4 rtl:hidden" />
                <ChevronLeft className="h-4 w-4 ltr:hidden" />
              </Button>
            </div>
          )}
        </div>

        {/* Empty state */}
        {profiles.length === 0 ? (
          <div className="reveal" style={{ transitionDelay: "80ms" }}>
            <div className="flex flex-col items-center justify-center gap-5 rounded-lg border border-border bg-background px-6 py-14 text-center">
              <p className="text-sm text-muted-foreground max-w-xs">{t.emptyMessage}</p>
              <Button asChild className="rounded-full hover-spring">
                <Link href="/inscription">{t.emptyAction}</Link>
              </Button>
            </div>
          </div>
        ) : (
          /* Horizontal scroll strip */
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pt-2 pb-4 -mx-4 px-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {profiles.map((profile, index) => (
              <div
                key={profile.id}
                className="reveal flex-shrink-0 w-72 snap-start"
                style={{ transitionDelay: `${(index + 1) * 80}ms` }}
              >
                <Link
                  href={`/profil/${profile.id}`}
                  className="group flex flex-col items-center text-center h-full bg-card rounded-lg border border-border hover:border-primary/40 transition-colors overflow-hidden"
                >
                  {/* Avatar */}
                  <div
                    className="relative mt-6 flex items-center justify-center rounded-full bg-secondary text-foreground font-semibold text-lg overflow-hidden shrink-0"
                    style={{ width: 72, height: 72 }}
                  >
                    {profile.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        fill
                        sizes="72px"
                        className="object-cover"
                      />
                    ) : (
                      getInitials(profile.full_name)
                    )}
                  </div>

                  {/* Card body */}
                  <div className="flex flex-col items-center gap-3 px-5 pb-5 pt-4 w-full flex-1">

                    {/* Name + verified badge */}
                    <div className="w-full">
                      <h3 className="font-bold text-base text-foreground leading-tight flex items-center justify-center gap-1.5 truncate">
                        <span className="truncate">{profile.full_name}</span>
                        {profile.cin_status === "verified" && (
                          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" aria-label="Identité vérifiée" />
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{profile.job_title}</p>
                      {profile.skills && profile.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center mt-1.5">
                          {profile.skills.slice(0, 3).map((skill) => (
                            <span key={skill} className="text-[10px] bg-secondary text-muted-foreground rounded-md px-2 py-0.5 leading-relaxed">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Star rating */}
                    {profile.rating != null ? (
                      <div className="flex flex-col items-center gap-1">
                        <StarRating rating={profile.rating} />
                        <span className="text-xs text-muted-foreground">
                          {profile.rating.toFixed(1)} · {profile.review_count} {t.reviews}
                        </span>
                      </div>
                    ) : (
                      <div className="h-8" />
                    )}

                    {/* Min price */}
                    {profile.min_price != null ? (
                      <div className="pt-3 border-t border-border/40 w-full">
                        <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wide">{t.from}</p>
                        <p className="text-2xl font-black text-primary leading-none">
                          {profile.min_price.toFixed(0)}{" "}
                          <span className="text-sm font-semibold">MAD</span>
                        </p>
                      </div>
                    ) : (
                      <div className="pt-3 border-t border-border/40 w-full" />
                    )}

                    {/* CTA */}
                    <span className="mt-auto w-full inline-flex items-center justify-center rounded-md border border-border text-foreground text-sm font-medium h-9 px-4 group-hover:border-primary/40 transition-colors">
                      {t.viewProfile}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
