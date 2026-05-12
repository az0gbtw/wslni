"use client"

import { FileText, Users, CheckCircle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"

const stepIcons = [FileText, Users, CheckCircle]
const stepNumbers = ["01", "02", "03"]

export function HowItWorksSection() {
  const { lang } = useLanguage()
  const t = translations[lang].howItWorks

  return (
    <section className="py-20 md:py-28 bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
            {t.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {t.subtitle}
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
          <div className="hidden md:block absolute top-20 start-1/6 end-1/6 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          {t.steps.map((step, index) => {
            const Icon = stepIcons[index]
            return (
              <div
                key={index}
                className="relative flex flex-col items-center text-center group"
              >
                <div className="absolute -top-4 start-1/2 -translate-x-1/2 text-6xl md:text-7xl font-bold text-primary/10 select-none">
                  {stepNumbers[index]}
                </div>

                <div className="relative z-10 mb-6 p-5 rounded-2xl bg-background shadow-lg shadow-primary/5 border border-border group-hover:border-primary/30 group-hover:shadow-xl group-hover:shadow-primary/10 transition-all duration-300">
                  <Icon className="w-8 h-8 text-primary" />
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs">
                  {step.description}
                </p>

                {index < t.steps.length - 1 && (
                  <div className="md:hidden mt-8 text-primary/30">
                    <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
