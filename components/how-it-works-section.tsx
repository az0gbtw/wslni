"use client"

import { FileText, Users, CheckCircle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

const STEP_ICONS = [FileText, Users, CheckCircle]

export function HowItWorksSection() {
  const { lang } = useLanguage()
  const t = translations[lang].howItWorks
  const sectionRef = useScrollReveal(0.1)

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="relative py-20 md:py-32 bg-white overflow-hidden"
    >
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        aria-hidden="true"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-14 md:mb-20 reveal" style={{ transitionDelay: "0ms" }}>
          <h2 className="font-display font-black text-4xl md:text-5xl text-foreground tracking-tight mb-3 leading-tight">
            {t.title}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-sm mx-auto">{t.subtitle}</p>
        </div>

        {/* Steps container */}
        <div className="relative grid md:grid-cols-3 gap-8 md:gap-10">

          {/* Desktop dashed connector line — vertically centered on the numbered circles (h-14 → top=28px) */}
          <div
            className="hidden md:block absolute border-t-2 border-dashed border-primary/25 pointer-events-none"
            style={{ top: "28px", left: "calc(100% / 6)", right: "calc(100% / 6)" }}
            aria-hidden="true"
          />

          {t.steps.map((step, index) => {
            const Icon = STEP_ICONS[index]
            return (
              <div
                key={index}
                className="reveal flex flex-col items-center text-center group gap-5"
                style={{ transitionDelay: `${(index + 1) * 90}ms` }}
              >
                {/* Step number bubble */}
                <div className="relative z-10 w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-primary flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary/30 ring-4 ring-primary/10 shrink-0">
                  {index + 1}
                </div>

                {/* Icon card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-red-500 to-primary shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/30 group-hover:-translate-y-1.5 transition-all duration-300">
                  <Icon className="w-9 h-9 text-white" />
                </div>

                {/* Title */}
                <h3 className="font-display font-black text-xl md:text-2xl text-foreground leading-tight">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">
                  {step.description}
                </p>

                {/* Mobile down-arrow connector */}
                {index < t.steps.length - 1 && (
                  <div className="md:hidden text-primary/35">
                    <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
