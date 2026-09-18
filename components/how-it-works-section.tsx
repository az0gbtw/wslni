"use client"

import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

export function HowItWorksSection() {
  const { lang } = useLanguage()
  const t = translations[lang].howItWorks
  const sectionRef = useScrollReveal(0.1)

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-16 md:py-24 bg-background"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

        <h2
          className="reveal font-serif font-bold text-3xl md:text-4xl text-foreground tracking-tight leading-tight mb-8 md:mb-10"
          style={{ transitionDelay: "0ms" }}
        >
          {t.title}
        </h2>

        <div className="border-t border-gray-100">
          {t.steps.map((step, index) => (
            <div
              key={index}
              className="reveal grid md:grid-cols-[1fr_2fr] gap-2 md:gap-10 py-6 border-b border-gray-100"
              style={{ transitionDelay: `${(index + 1) * 70}ms` }}
            >
              <h3 className="font-semibold text-lg text-foreground">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
