"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  MessageSquare,
  CheckCircle,
  UserCircle,
  Zap,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Banknote,
  Star,
  FileText,
  Clock,
  Briefcase,
} from "lucide-react"

function ZelligeDivider() {
  return (
    <div className="w-full h-2 flex overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-full ${
            i % 4 === 0 ? "bg-primary" : i % 4 === 1 ? "bg-primary/70" : i % 4 === 2 ? "bg-secondary" : "bg-primary/40"
          }`}
        />
      ))}
    </div>
  )
}

const clientSteps = [
  {
    number: "01",
    icon: Search,
    title: "Trouve le bon talent",
    description:
      "Parcours des milliers de profils de freelances vérifiés ou publie ton projet et reçois des offres directement. Filtre par compétence, budget et disponibilité.",
    detail: "Accès gratuit à tous les profils",
  },
  {
    number: "02",
    icon: MessageSquare,
    title: "Discute & valide le devis",
    description:
      "Échange directement avec le freelance via la messagerie intégrée. Précise tes attentes, reçois le devis détaillé et valide la commande en toute confiance.",
    detail: "Paiement sécurisé en escrow",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Reçois et valide le travail",
    description:
      "Le freelance livre son travail via la plateforme. Tu as le temps de vérifier, demander des corrections si besoin, puis valider. Le paiement est libéré uniquement quand tu es satisfait.",
    detail: "Garantie de satisfaction",
  },
]

const freelanceSteps = [
  {
    number: "01",
    icon: UserCircle,
    title: "Crée ton profil professionnel",
    description:
      "Mets en valeur tes compétences, ajoute des exemples de ton portfolio et fixe tes tarifs. L'inscription est 100 % gratuite et prend moins de 5 minutes.",
    detail: "Inscription totalement gratuite",
  },
  {
    number: "02",
    icon: Zap,
    title: "Reçois des commandes",
    description:
      "Les clients te contactent directement ou tu réponds aux projets qui correspondent à ton expertise. Négocie, crée une offre personnalisée et confirme la commande.",
    detail: "Notifications en temps réel",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Livre & développe ta réputation",
    description:
      "Livre un travail de qualité dans les délais, accumule des avis positifs et monte dans les classements. Plus ta réputation grandit, plus tu attires des clients premium.",
    detail: "Paiement rapide et sécurisé",
  },
]

const clientGuarantees = [
  { icon: ShieldCheck, label: "Paiement sécurisé en escrow" },
  { icon: Star, label: "Freelances vérifiés et évalués" },
  { icon: MessageSquare, label: "Support client disponible" },
  { icon: CheckCircle, label: "Remboursement si non satisfait" },
]

const freelanceGuarantees = [
  { icon: Banknote, label: "Paiement rapide et garanti" },
  { icon: FileText, label: "Contrat clair pour chaque commande" },
  { icon: Clock, label: "Délais respectés et protégés" },
  { icon: Briefcase, label: "Visibilité auprès de milliers de clients" },
]

export default function CommentCaMarchePage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-secondary via-background to-secondary/30 overflow-hidden">
        <svg
          className="absolute -end-16 top-8 w-72 h-72 opacity-8 animate-float pointer-events-none"
          viewBox="0 0 200 200"
          fill="none"
        >
          <path
            d="M100 0L117.32 50L170.71 50L127.69 80.9L145.04 130.9L100 100L54.96 130.9L72.31 80.9L29.29 50L82.68 50L100 0Z"
            fill="currentColor"
            className="text-primary"
          />
        </svg>
        <svg
          className="absolute -start-12 bottom-0 w-56 h-56 opacity-6 pointer-events-none"
          viewBox="0 0 100 100"
          fill="none"
        >
          <rect x="10" y="10" width="80" height="80" rx="4" fill="currentColor" className="text-secondary" transform="rotate(45 50 50)" />
        </svg>

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Simple, rapide, sécurisé</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-5 text-balance">
            Comment ça marche sur{" "}
            <span className="text-primary">Wslni.ma</span>&nbsp;?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Une expérience pensée pour être simple et sécurisée, que tu sois un client qui cherche un talent ou un freelance prêt à monetiser ses compétences.
          </p>
        </div>
      </section>

      <ZelligeDivider />

      {/* Tabs Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="client" className="w-full">
            <div className="flex justify-center mb-12">
              <TabsList className="h-12 p-1 rounded-2xl bg-secondary border border-border gap-1">
                <TabsTrigger
                  value="client"
                  className="px-8 py-2.5 text-sm font-semibold rounded-xl data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                >
                  Je suis client
                </TabsTrigger>
                <TabsTrigger
                  value="freelance"
                  className="px-8 py-2.5 text-sm font-semibold rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
                >
                  Je suis freelance
                </TabsTrigger>
              </TabsList>
            </div>

            {/* CLIENT TAB */}
            <TabsContent value="client">
              <div className="space-y-6 mb-14">
                {clientSteps.map((step, i) => {
                  const Icon = step.icon
                  return (
                    <div
                      key={i}
                      className="group flex gap-6 p-6 sm:p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                    >
                      {/* Number + connector */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 border-2 border-primary/20 group-hover:bg-primary/15 group-hover:border-primary/40 flex items-center justify-center transition-all duration-300">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        {i < clientSteps.length - 1 && (
                          <div className="w-0.5 flex-1 mt-3 bg-gradient-to-b from-primary/20 to-transparent min-h-[2rem]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="text-3xl font-black text-primary/20 leading-none">{step.number}</span>
                          <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed mb-3">{step.description}</p>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/8 px-3 py-1 rounded-full border border-primary/15">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {step.detail}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Guarantees */}
              <div className="mb-12 p-6 sm:p-8 rounded-2xl bg-secondary/50 border border-border">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">Ce que nous garantissons</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {clientGuarantees.map((g, i) => {
                    const Icon = g.icon
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{g.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Client CTA */}
              <div className="text-center p-10 rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground relative overflow-hidden">
                <svg className="absolute -end-8 -bottom-8 w-40 h-40 opacity-10 pointer-events-none" viewBox="0 0 200 200" fill="currentColor">
                  <path d="M100 0L117.32 50L170.71 50L127.69 80.9L145.04 130.9L100 100L54.96 130.9L72.31 80.9L29.29 50L82.68 50L100 0Z" />
                </svg>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-3">Prêt à trouver le bon talent&nbsp;?</h3>
                  <p className="text-primary-foreground/75 mb-7 max-w-sm mx-auto">
                    Des milliers de freelances marocains qualifiés attendent ton projet.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <Button
                      asChild
                      size="lg"
                      className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold shadow-lg"
                    >
                      <Link href="/services">
                        Parcourir les services
                        <ArrowRight className="ms-2 w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50"
                    >
                      <Link href="/inscription">Créer un compte gratuit</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* FREELANCE TAB */}
            <TabsContent value="freelance">
              <div className="space-y-6 mb-14">
                {freelanceSteps.map((step, i) => {
                  const Icon = step.icon
                  return (
                    <div
                      key={i}
                      className="group flex gap-6 p-6 sm:p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                    >
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 border-2 border-primary/20 group-hover:bg-primary/15 group-hover:border-primary/40 flex items-center justify-center transition-all duration-300">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        {i < freelanceSteps.length - 1 && (
                          <div className="w-0.5 flex-1 mt-3 bg-gradient-to-b from-primary/20 to-transparent min-h-[2rem]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="text-3xl font-black text-primary/20 leading-none">{step.number}</span>
                          <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed mb-3">{step.description}</p>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/8 px-3 py-1 rounded-full border border-primary/15">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {step.detail}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Guarantees */}
              <div className="mb-12 p-6 sm:p-8 rounded-2xl bg-secondary/50 border border-border">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">Ce que nous garantissons</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {freelanceGuarantees.map((g, i) => {
                    const Icon = g.icon
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{g.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Freelance CTA */}
              <div className="text-center p-10 rounded-3xl bg-gradient-to-br from-foreground to-foreground/80 text-primary-foreground relative overflow-hidden">
                <svg className="absolute -start-8 -bottom-8 w-40 h-40 opacity-10 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                  <rect x="10" y="10" width="80" height="80" rx="4" transform="rotate(45 50 50)" />
                </svg>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-3">Prêt à monetiser tes compétences&nbsp;?</h3>
                  <p className="text-primary-foreground/70 mb-7 max-w-sm mx-auto">
                    Rejoins des milliers de freelances marocains qui gagnent leur vie grâce à leurs talents.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <Button
                      asChild
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/30"
                    >
                      <Link href="/inscription">
                        Créer mon profil gratuitement
                        <ArrowRight className="ms-2 w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/50"
                    >
                      <Link href="/a-propos">En savoir plus</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="py-12 bg-secondary/40 border-t border-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground mb-4">
            Tu as encore des questions sur le fonctionnement de la plateforme&nbsp;?
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild variant="outline" className="border-2 hover:border-primary hover:text-primary transition-all">
              <Link href="/faq">Consulter la FAQ</Link>
            </Button>
            <Button asChild variant="outline" className="border-2 hover:border-primary hover:text-primary transition-all">
              <Link href="/aide">Centre d'aide</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
