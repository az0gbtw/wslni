"use client"

import { Users, Grid3X3, ShieldCheck, HeadphonesIcon } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"

const statIcons = [Users, Grid3X3, ShieldCheck, HeadphonesIcon]
const statValues = ["12,000+", "50+", "100%", "7j/7"]

export function TrustBannerSection() {
  const { lang } = useLanguage()
  const t = translations[lang].trust
  const statLabels = [t.freelances, t.categories, t.securePay, t.support]

  return (
    <section className="py-16 md:py-20 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {statValues.map((value, index) => {
            const Icon = statIcons[index]
            return (
              <div key={index} className="flex flex-col items-center text-center group">
                <div className="mb-3 p-3 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors">
                  <Icon className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <div className="text-2xl md:text-3xl font-bold mb-1">{value}</div>
                <div className="text-sm md:text-base text-primary-foreground/80">
                  {statLabels[index]}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
