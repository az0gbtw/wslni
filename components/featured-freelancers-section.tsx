"use client"

import { useRef } from "react"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

const freelancers = [
  { name: "Yasmine B.", skill: "UI/UX Design", rating: 4.9, reviews: 127, price: 250, avatar: "YB", gradient: "from-rose-400 to-pink-500" },
  { name: "Mehdi A.", skill: "Web Development", rating: 5.0, reviews: 89, price: 300, avatar: "MA", gradient: "from-blue-400 to-indigo-500" },
  { name: "Fatima Z.", skill: "Video Editing", rating: 4.8, reviews: 156, price: 150, avatar: "FZ", gradient: "from-amber-400 to-orange-500" },
  { name: "Amine K.", skill: "3D Animation", rating: 4.9, reviews: 64, price: 400, avatar: "AK", gradient: "from-emerald-400 to-teal-500" },
  { name: "Sara L.", skill: "Copywriting", rating: 5.0, reviews: 203, price: 100, avatar: "SL", gradient: "from-purple-400 to-violet-500" },
  { name: "Omar H.", skill: "Photography", rating: 4.7, reviews: 98, price: 200, avatar: "OH", gradient: "from-cyan-400 to-sky-500" },
]

export function FeaturedFreelancersSection() {
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
          {freelancers.map((freelancer, index) => (
            <div
              key={index}
              className="reveal flex-shrink-0 w-72 snap-start overflow-visible"
              style={{ transitionDelay: `${(index + 1) * 80}ms` }}
            >
              <div className="group relative bg-gradient-to-br from-card via-card to-secondary/40 rounded-2xl border border-border/60 p-6 shadow-sm hover:shadow-xl hover:shadow-primary/8 hover:border-primary/25 transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-visible">
                {freelancer.rating === 5.0 && (
                  <div className="absolute -top-2.5 end-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full z-10 shadow-sm shadow-primary/30">
                    Top Rated
                  </div>
                )}

                <div className="flex items-start gap-4 mb-5">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${freelancer.gradient} flex items-center justify-center text-white font-bold text-base shadow-lg`}>
                    {freelancer.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{freelancer.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{freelancer.skill}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-5">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-semibold text-foreground">{freelancer.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({freelancer.reviews} {t.reviews})
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">{t.from}</p>
                    <p className="text-xl font-black text-primary font-display">
                      {freelancer.price} <span className="text-sm font-normal text-muted-foreground">DH</span>
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-primary/25 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary hover-spring rounded-full"
                  >
                    {t.viewProfile}
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
