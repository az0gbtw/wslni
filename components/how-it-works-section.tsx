"use client"

import { FileText, Users, CheckCircle } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Décris ton besoin",
    description: "Explique ton projet en quelques mots. Sois précis sur tes attentes et ton budget.",
  },
  {
    number: "02",
    icon: Users,
    title: "Choisis ton freelance",
    description: "Compare les profils, portfolios et avis. Trouve le talent parfait pour ta mission.",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Reçois ton travail",
    description: "Collabore en temps réel, valide les livrables et paie en toute sécurité.",
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-20 md:py-28 bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
            Comment ça marche ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Trois étapes simples pour trouver le freelance idéal
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
          {/* Connection Line - Desktop */}
          <div className="hidden md:block absolute top-20 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={index}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-6xl md:text-7xl font-bold text-primary/10 select-none">
                  {step.number}
                </div>
                
                {/* Icon Container */}
                <div className="relative z-10 mb-6 p-5 rounded-2xl bg-background shadow-lg shadow-primary/5 border border-border group-hover:border-primary/30 group-hover:shadow-xl group-hover:shadow-primary/10 transition-all duration-300">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs">
                  {step.description}
                </p>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
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
