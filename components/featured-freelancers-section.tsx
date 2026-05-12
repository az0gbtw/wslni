"use client"

import { useRef } from "react"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const freelancers = [
  {
    name: "Yasmine B.",
    skill: "UI/UX Design",
    rating: 4.9,
    reviews: 127,
    price: 250,
    avatar: "YB",
    gradient: "from-rose-400 to-pink-500",
  },
  {
    name: "Mehdi A.",
    skill: "Web Development",
    rating: 5.0,
    reviews: 89,
    price: 300,
    avatar: "MA",
    gradient: "from-blue-400 to-indigo-500",
  },
  {
    name: "Fatima Z.",
    skill: "Video Editing",
    rating: 4.8,
    reviews: 156,
    price: 150,
    avatar: "FZ",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    name: "Amine K.",
    skill: "3D Animation",
    rating: 4.9,
    reviews: 64,
    price: 400,
    avatar: "AK",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    name: "Sara L.",
    skill: "Copywriting",
    rating: 5.0,
    reviews: 203,
    price: 100,
    avatar: "SL",
    gradient: "from-purple-400 to-violet-500",
  },
  {
    name: "Omar H.",
    skill: "Photography",
    rating: 4.7,
    reviews: 98,
    price: 200,
    avatar: "OH",
    gradient: "from-cyan-400 to-sky-500",
  },
]

export function FeaturedFreelancersSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <section className="py-12 md:py-28 bg-background overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 text-balance">
              Freelances en vedette
            </h2>
            <p className="text-lg text-muted-foreground">
              Découvre nos talents les mieux notés
            </p>
          </div>
          
          {/* Navigation Arrows */}
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

        {/* Freelancers Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex gap-5 overflow-x-auto pt-4 pb-4 -mx-4 px-4 -mt-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {freelancers.map((freelancer, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-72 snap-start group overflow-visible"
            >
              <div className="relative bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-2xl hover:border-primary/30 transition-all duration-200 hover:-translate-y-2 cursor-pointer overflow-visible">
                {/* Top Badge */}
                {freelancer.rating === 5.0 && (
                  <div className="absolute -top-2 right-3 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full z-10">
                    Top Rated
                  </div>
                )}
                
                {/* Avatar & Info */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${freelancer.gradient} flex items-center justify-center text-white font-semibold text-lg shadow-lg`}>
                    {freelancer.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {freelancer.name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {freelancer.skill}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-medium text-foreground">{freelancer.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({freelancer.reviews} avis)
                  </span>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">À partir de</p>
                    <p className="text-lg font-bold text-primary">
                      {freelancer.price} <span className="text-sm font-normal">DH</span>
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    Voir profil
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
