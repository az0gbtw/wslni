import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import {
  Target,
  Users,
  Zap,
  Heart,
  ArrowRight,
  CheckCircle,
  Shield,
  Globe,
  Search,
  MessageSquare,
  Star,
  TrendingUp,
} from "lucide-react"

function ZelligeDivider() {
  return (
    <div className="w-full h-2 flex overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-full ${
            i % 4 === 0
              ? "bg-primary"
              : i % 4 === 1
              ? "bg-primary/70"
              : i % 4 === 2
              ? "bg-secondary"
              : "bg-primary/40"
          }`}
        />
      ))}
    </div>
  )
}

function ZelligeHeroPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute -end-20 top-10 w-[28rem] h-[28rem] opacity-10 animate-float"
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
        className="absolute -start-16 bottom-0 w-80 h-80 opacity-8"
        viewBox="0 0 100 100"
        fill="none"
      >
        <rect
          x="10" y="10" width="80" height="80" rx="4"
          fill="currentColor"
          className="text-secondary"
          transform="rotate(45 50 50)"
        />
      </svg>

      <svg
        className="absolute end-[20%] bottom-[15%] w-16 h-16 opacity-10 animate-float"
        style={{ animationDelay: "3s" }}
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
        className="absolute start-[25%] top-[20%] w-12 h-12 opacity-8 animate-float"
        style={{ animationDelay: "1.5s" }}
        viewBox="0 0 200 200"
        fill="none"
      >
        <path
          d="M100 0L117.32 50L170.71 50L127.69 80.9L145.04 130.9L100 100L54.96 130.9L72.31 80.9L29.29 50L82.68 50L100 0Z"
          fill="currentColor"
          className="text-primary"
        />
      </svg>

      <div className="absolute end-1/4 top-1/3 w-4 h-4 bg-primary/20 rotate-45 animate-pulse-subtle" />
      <div className="absolute start-1/3 top-1/4 w-3 h-3 bg-primary/30 rotate-45" style={{ animationDelay: "0.5s" }} />
      <div className="absolute end-1/3 bottom-1/4 w-5 h-5 border-2 border-primary/20 rotate-45" />
      <div className="absolute start-[15%] bottom-[35%] w-3 h-3 border-2 border-secondary/60 rotate-45 animate-pulse-subtle" style={{ animationDelay: "2s" }} />

      <div className="absolute top-0 start-0 w-full h-32 bg-gradient-to-b from-secondary/40 to-transparent" />
      <div className="absolute bottom-0 start-0 w-full h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  )
}

const values = [
  {
    icon: Shield,
    title: "Confiance",
    description:
      "Chaque freelance est vérifié. Chaque transaction est sécurisée. Tu peux collaborer en toute sérénité.",
  },
  {
    icon: Star,
    title: "Qualité",
    description:
      "Des profils évalués par la communauté pour garantir un niveau d'excellence à chaque projet.",
  },
  {
    icon: Heart,
    title: "Communauté",
    description:
      "Une famille de talents marocains qui se soutiennent, partagent et grandissent ensemble.",
  },
  {
    icon: Globe,
    title: "Accessibilité",
    description:
      "Des services adaptés à tous les budgets pour démocratiser l'accès au travail freelance.",
  },
]

const clientSteps = [
  {
    icon: Search,
    number: "01",
    title: "Trouve le talent",
    description:
      "Parcours des milliers de profils de freelances qualifiés ou publie ton projet et reçois des offres.",
  },
  {
    icon: MessageSquare,
    number: "02",
    title: "Discute & valide",
    description:
      "Échange directement avec le freelance, précise tes besoins et valide le devis en toute confiance.",
  },
  {
    icon: CheckCircle,
    number: "03",
    title: "Reçois ton travail",
    description:
      "Le paiement est sécurisé et libéré uniquement quand tu es satisfait du résultat livré.",
  },
]

const freelanceSteps = [
  {
    icon: Users,
    number: "01",
    title: "Crée ton profil",
    description:
      "Mets en valeur tes compétences, ton portfolio et tes tarifs. C'est gratuit et ça prend 5 minutes.",
  },
  {
    icon: Zap,
    number: "02",
    title: "Reçois des commandes",
    description:
      "Les clients te contactent directement ou tu réponds aux projets qui correspondent à ton expertise.",
  },
  {
    icon: TrendingUp,
    number: "03",
    title: "Développe ton activité",
    description:
      "Accumule des avis positifs, gagne en visibilité et transforme Wslni.ma en source de revenus régulière.",
  },
]

const stats = [
  { value: "30%", label: "des jeunes Marocains au chômage", sublabel: "source : Haut-Commissariat au Plan" },
  { value: "500K+", label: "diplômés entrent sur le marché du travail chaque année", sublabel: "sans trouver d'emploi stable" },
  { value: "72%", label: "des PME marocaines manquent de compétences digitales", sublabel: "que les freelances peuvent combler" },
]

export default function AProposPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary/30 pt-16 overflow-hidden">
        <ZelligeHeroPattern />

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-subtle" />
            <span className="text-sm font-medium text-primary">
              Lancé en 2024 · Fièrement marocain
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 text-balance">
            Connecter les{" "}
            <span className="text-primary relative">
              talents marocains
              <svg
                className="absolute -bottom-2 start-0 w-full h-3 text-primary/30"
                viewBox="0 0 200 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <path d="M2 10C50 2 150 2 198 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
            <br />
            avec le monde
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
            Wslni.ma est la première marketplace freelance 100% marocaine. Notre mission&nbsp;: donner à chaque jeune talent du Maroc les moyens de vivre de ses compétences.
          </p>
        </div>
      </section>

      <ZelligeDivider />

      {/* ── MISSION ── */}
      <section className="bg-primary text-primary-foreground py-20 md:py-28 relative overflow-hidden">
        {/* Subtle zellige decorations on red background */}
        <svg
          className="absolute -end-16 top-8 w-72 h-72 opacity-5"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <path d="M100 0L117.32 50L170.71 50L127.69 80.9L145.04 130.9L100 100L54.96 130.9L72.31 80.9L29.29 50L82.68 50L100 0Z" />
        </svg>
        <svg
          className="absolute -start-12 bottom-8 w-64 h-64 opacity-5"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <rect x="10" y="10" width="80" height="80" rx="4" transform="rotate(45 50 50)" />
        </svg>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-7 h-7 opacity-80" />
            <span className="text-sm font-semibold uppercase tracking-widest opacity-80">
              Notre mission
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-balance leading-tight">
                Lutter contre le chômage des jeunes au Maroc
              </h2>
              <p className="text-primary-foreground/80 text-lg leading-relaxed mb-6">
                Le Maroc possède l'un des viviers de talents les plus riches d'Afrique. Pourtant, des milliers de jeunes diplômés peinent à trouver un emploi stable malgré leurs compétences.
              </p>
              <p className="text-primary-foreground/80 text-lg leading-relaxed">
                Wslni.ma brise cette barrière. En connectant directement freelances et clients, nous créons un écosystème économique inclusif où le talent prime sur le réseau ou le diplôme.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-colors"
                >
                  <div className="text-3xl font-black shrink-0">{stat.value}</div>
                  <div>
                    <p className="font-semibold leading-snug">{stat.label}</p>
                    <p className="text-sm text-primary-foreground/60 mt-0.5">{stat.sublabel}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section className="py-20 md:py-28 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Comment ça marche&nbsp;?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Une expérience simple et sécurisée, que tu sois client ou freelance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            {/* Pour les clients */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8">
                <span className="text-sm font-semibold text-primary">Pour les clients</span>
              </div>
              <div className="space-y-8">
                {clientSteps.map((step, i) => {
                  const Icon = step.icon
                  return (
                    <div key={i} className="flex gap-5 group">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-background border-2 border-border group-hover:border-primary/40 shadow-sm flex items-center justify-center transition-colors">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        {i < clientSteps.length - 1 && (
                          <div className="absolute top-12 start-1/2 -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-border to-transparent" />
                        )}
                      </div>
                      <div className="pb-8">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-primary/50">{step.number}</span>
                          <h3 className="font-semibold text-foreground">{step.title}</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed text-sm">{step.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Pour les freelances */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary border border-border mb-8">
                <span className="text-sm font-semibold text-foreground">Pour les freelances</span>
              </div>
              <div className="space-y-8">
                {freelanceSteps.map((step, i) => {
                  const Icon = step.icon
                  return (
                    <div key={i} className="flex gap-5 group">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-background border-2 border-border group-hover:border-primary/40 shadow-sm flex items-center justify-center transition-colors">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        {i < freelanceSteps.length - 1 && (
                          <div className="absolute top-12 start-1/2 -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-border to-transparent" />
                        )}
                      </div>
                      <div className="pb-8">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-primary/50">{step.number}</span>
                          <h3 className="font-semibold text-foreground">{step.title}</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed text-sm">{step.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NOS VALEURS ── */}
      <section className="py-20 md:py-28 bg-secondary/40 relative overflow-hidden">
        {/* Zellige tile accent */}
        <div className="absolute end-0 top-0 bottom-0 w-2 flex flex-col overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 ${
                i % 4 === 0 ? "bg-primary" :
                i % 4 === 1 ? "bg-primary/70" :
                i % 4 === 2 ? "bg-secondary" :
                "bg-primary/40"
              }`}
            />
          ))}
        </div>
        <div className="absolute start-0 top-0 bottom-0 w-2 flex flex-col overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 ${
                i % 4 === 0 ? "bg-primary/40" :
                i % 4 === 1 ? "bg-secondary" :
                i % 4 === 2 ? "bg-primary/70" :
                "bg-primary"
              }`}
            />
          ))}
        </div>

        <div className="mx-auto max-w-7xl px-8 sm:px-10 lg:px-16">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Ce qui nous guide
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Quatre valeurs fondamentales au cœur de chaque décision que nous prenons.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => {
              const Icon = value.icon
              return (
                <div
                  key={i}
                  className="group p-6 rounded-2xl bg-background border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className="mb-4 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 via-background to-secondary relative overflow-hidden">
        <svg
          className="absolute -start-20 -bottom-20 w-[26rem] h-[26rem] opacity-8 animate-float"
          style={{ animationDelay: "1s" }}
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
          className="absolute -end-10 top-10 w-64 h-64 opacity-8"
          viewBox="0 0 100 100"
          fill="none"
        >
          <rect
            x="10" y="10" width="80" height="80" rx="4"
            fill="currentColor"
            className="text-secondary"
            transform="rotate(45 50 50)"
          />
        </svg>

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Rejoins la communauté</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Prêt à faire partie de l'aventure&nbsp;?
          </h2>

          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto text-pretty">
            Que tu cherches un talent ou que tu veuilles monétiser tes compétences, Wslni.ma est fait pour toi. Inscription gratuite, sans engagement.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto text-base px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 group"
            >
              <Link href="/inscription">
                Je suis freelance
                <ArrowRight className="ms-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-base px-8 py-6 border-2 border-foreground/20 hover:border-primary hover:text-primary transition-all duration-300"
            >
              <Link href="/inscription">
                Je cherche un talent
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
