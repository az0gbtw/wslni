"use client"

import { FileText, Users, CheckCircle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

const stepIcons = [FileText, Users, CheckCircle]
const stepNumbers = ["01", "02", "03"]

export function HowItWorksSection() {
  const { lang } = useLanguage()
  const t = translations[lang].howItWorks
  const sectionRef = useScrollReveal(0.1)

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-24 md:py-36 bg-gradient-to-b from-secondary/50 via-secondary/30 to-background"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-18 md:mb-24 reveal" style={{ transitionDelay: "0ms" }}>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-foreground mb-5 text-balance leading-tight">
            {t.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {t.subtitle}
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-14 relative">
          <div className="hidden md:block absolute top-20 start-1/6 end-1/6 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

          {t.steps.map((step, index) => {
            const Icon = stepIcons[index]
            return (
              <div
                key={index}
                className="reveal relative flex flex-col items-center text-center group"
                style={{ transitionDelay: `${(index + 1) * 80}ms` }}
              >
                <div className="absolute -top-5 start-1/2 -translate-x-1/2 text-7xl md:text-8xl font-black text-primary/8 select-none font-display">
                  {stepNumbers[index]}
                </div>

                <div className="relative z-10 mb-7 p-6 rounded-2xl bg-gradient-to-br from-background to-secondary/50 shadow-lg shadow-primary/5 border border-border/60 group-hover:border-primary/30 group-hover:shadow-xl group-hover:shadow-primary/10 transition-all duration-300">
                  <Icon className="w-8 h-8 text-primary" />
                </div>

                <h3 className="font-display font-bold text-xl text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs">
                  {step.description}
                </p>

                {index < t.steps.length - 1 && (
                  <div className="md:hidden mt-10 text-primary/30">
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
