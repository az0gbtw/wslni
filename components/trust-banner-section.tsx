"use client"

import { Users, Grid3X3, ShieldCheck, HeadphonesIcon } from "lucide-react"

const stats = [
  {
    icon: Users,
    value: "12,000+",
    label: "Freelances",
  },
  {
    icon: Grid3X3,
    value: "50+",
    label: "Catégories",
  },
  {
    icon: ShieldCheck,
    value: "100%",
    label: "Paiement sécurisé",
  },
  {
    icon: HeadphonesIcon,
    value: "7j/7",
    label: "Support client",
  },
]

export function TrustBannerSection() {
  return (
    <section className="py-16 md:py-20 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center group"
              >
                <div className="mb-3 p-3 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors">
                  <Icon className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <div className="text-2xl md:text-3xl font-bold mb-1">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-primary-foreground/80">
                  {stat.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
