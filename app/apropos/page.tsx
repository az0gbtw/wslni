import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import {
  Target,
  Users,
  ArrowRight,
  Shield,
  Star,
  Heart,
  Globe,
  Lightbulb,
  Flag,
  TrendingUp,
  Handshake,
  BookOpen,
  UserCircle,
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
        <rect x="10" y="10" width="80" height="80" rx="4" fill="currentColor" className="text-secondary" transform="rotate(45 50 50)" />
      </svg>
      <svg
        className="absolute end-[20%] bottom-[15%] w-16 h-16 opacity-10 animate-float"
        style={{ animationDelay: "3s" }}
        viewBox="0 0 200 200"
        fill="none"
      >
        <path d="M100 0L117.32 50L170.71 50L127.69 80.9L145.04 130.9L100 100L54.96 130.9L72.31 80.9L29.29 50L82.68 50L100 0Z" fill="currentColor" className="text-primary" />
      </svg>
      <svg
        className="absolute start-[25%] top-[20%] w-12 h-12 opacity-8 animate-float"
        style={{ animationDelay: "1.5s" }}
        viewBox="0 0 200 200"
        fill="none"
      >
        <path d="M100 0L117.32 50L170.71 50L127.69 80.9L145.04 130.9L100 100L54.96 130.9L72.31 80.9L29.29 50L82.68 50L100 0Z" fill="currentColor" className="text-primary" />
      </svg>
      <div className="absolute end-1/4 top-1/3 w-4 h-4 bg-primary/20 rotate-45 animate-pulse-subtle" />
      <div className="absolute start-1/3 top-1/4 w-3 h-3 bg-primary/30 rotate-45" />
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
    description: "Chaque freelance est vérifié. Chaque transaction est sécurisée. Tu peux collaborer en toute sérénité.",
  },
  {
    icon: Star,
    title: "Qualité",
    description: "Des profils évalués par la communauté pour garantir un niveau d'excellence à chaque projet.",
  },
  {
    icon: Globe,
    title: "Accessibilité",
    description: "Des services adaptés à tous les budgets pour démocratiser l'accès au travail freelance au Maroc.",
  },
  {
    icon: Flag,
    title: "Fierté locale",
    description: "Wslni.ma est 100 % marocain. Nous valorisons le talent local et construisons une économie numérique nationale.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "Nous construisons la plateforme que le Maroc mérite — moderne, rapide et pensée pour les usages locaux.",
  },
  {
    icon: TrendingUp,
    title: "Impact social",
    description: "Chaque commande passée sur Wslni.ma contribue à réduire le chômage et à renforcer l'économie marocaine.",
  },
]

const missionStats = [
  { value: "30 %", label: "des jeunes Marocains au chômage", sublabel: "source : Haut-Commissariat au Plan" },
  { value: "500 K+", label: "diplômés entrent sur le marché du travail chaque année", sublabel: "sans trouver d'emploi stable" },
  { value: "72 %", label: "des PME marocaines manquent de compétences digitales", sublabel: "que les freelances peuvent combler" },
]

const historyMilestones = [
  {
    year: "2022",
    title: "L'idée germe",
    description: "Constat simple : des dizaines de jeunes diplômés marocains, compétents et motivés, sans accès à un marché du travail local qui les valorise. Les plateformes internationales existent mais ne parlent pas leur langue ni leur réalité.",
  },
  {
    year: "2023",
    title: "La construction",
    description: "Une petite équipe de passionnés se constitue à Casablanca. Des mois de recherches, d'interviews avec des freelances et des clients, de prototypes et d'itérations pour construire une plateforme adaptée au contexte marocain.",
  },
  {
    year: "2024",
    title: "Le lancement",
    description: "Wslni.ma est officiellement lancé. La plateforme ouvre ses portes aux premiers freelances et clients, avec la mission claire de devenir le hub du travail indépendant au Maroc.",
  },
]

const teamPlaceholders = [
  { initials: "AE", name: "Ahmed El Fassi", role: "Co-fondateur & CEO", location: "Casablanca" },
  { initials: "SM", name: "Sara Moussaoui", role: "Co-fondatrice & CPO", location: "Rabat" },
  { initials: "YB", name: "Youssef Benali", role: "CTO", location: "Casablanca" },
  { initials: "FZ", name: "Bientôt", role: "Poste à pourvoir", location: "" },
]

interface PlatformStats {
  freelancers: number
  services: number
  orders: number
}

async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const supabase = await createClient()
    const [profilesResult, servicesResult, ordersResult] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "freelance"),
      supabase.from("services").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
    ])
    return {
      freelancers: profilesResult.count ?? 0,
      services: servicesResult.count ?? 0,
      orders: ordersResult.count ?? 0,
    }
  } catch {
    return { freelancers: 0, services: 0, orders: 0 }
  }
}

function formatStat(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".0", "")} K`
  return n.toString()
}

export default async function AProposPage() {
  const stats = await getPlatformStats()

  const platformStats = [
    {
      value: stats.freelancers > 0 ? formatStat(stats.freelancers) : "En croissance",
      label: "Freelances inscrits",
      sublabel: "Talents vérifiés et actifs",
    },
    {
      value: stats.services > 0 ? formatStat(stats.services) : "En croissance",
      label: "Services disponibles",
      sublabel: "Dans 9 catégories",
    },
    {
      value: stats.orders > 0 ? formatStat(stats.orders) : "En croissance",
      label: "Commandes réalisées",
      sublabel: "Projets livrés avec succès",
    },
    {
      value: "2",
      label: "Langues supportées",
      sublabel: "Français & العربية",
    },
  ]

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
            Wslni.ma est la première marketplace freelance 100 % marocaine. Notre mission : donner à chaque jeune talent du Maroc les moyens de vivre de ses compétences.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 px-8 py-6 text-base group">
              <Link href="/inscription">
                Rejoindre Wslni.ma
                <ArrowRight className="ms-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-foreground/20 hover:border-primary hover:text-primary transition-all px-8 py-6 text-base">
              <Link href="/comment-ca-marche">Comment ça marche</Link>
            </Button>
          </div>
        </div>
      </section>

      <ZelligeDivider />

      {/* ── NOTRE HISTOIRE ── */}
      <section className="py-20 md:py-28 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
                <span className="text-sm font-semibold uppercase tracking-widest text-primary">Notre histoire</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 text-balance leading-tight">
                Né de la frustration, construit avec conviction
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                Au Maroc, des milliers de jeunes issus de la <strong className="text-foreground">génération NEET</strong> — ni en emploi, ni en études, ni en formation — portent des compétences réelles qui ne trouvent pas preneur sur le marché du travail traditionnel.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Les plateformes freelance internationales existent. Mais elles parlent une autre langue, proposent des devises étrangères, imposent des frais inaccessibles et ignorent les réalités bancaires marocaines.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Wslni.ma est né de ce constat. Une plateforme pensée au Maroc, pour les Marocains, avec les spécificités locales au cœur du design : darija ou français, dirham marocain, virement local, et un support qui comprend ta réalité.
              </p>
            </div>

            <div className="space-y-0">
              {historyMilestones.map((m, i) => (
                <div key={i} className="flex gap-5 group">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/25 flex items-center justify-center group-hover:bg-primary/15 group-hover:border-primary/40 transition-all">
                      <span className="text-xs font-black text-primary">{m.year}</span>
                    </div>
                    {i < historyMilestones.length - 1 && (
                      <div className="w-0.5 flex-1 mt-2 bg-gradient-to-b from-primary/20 to-transparent min-h-[3rem]" />
                    )}
                  </div>
                  <div className="pb-10 pt-2">
                    <h3 className="font-bold text-foreground mb-2">{m.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="bg-primary text-primary-foreground py-20 md:py-28 relative overflow-hidden">
        <svg className="absolute -end-16 top-8 w-72 h-72 opacity-5" viewBox="0 0 200 200" fill="currentColor">
          <path d="M100 0L117.32 50L170.71 50L127.69 80.9L145.04 130.9L100 100L54.96 130.9L72.31 80.9L29.29 50L82.68 50L100 0Z" />
        </svg>
        <svg className="absolute -start-12 bottom-8 w-64 h-64 opacity-5" viewBox="0 0 100 100" fill="currentColor">
          <rect x="10" y="10" width="80" height="80" rx="4" transform="rotate(45 50 50)" />
        </svg>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-7 h-7 opacity-80" />
            <span className="text-sm font-semibold uppercase tracking-widest opacity-80">Notre mission</span>
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

            <div className="grid grid-cols-1 gap-5">
              {missionStats.map((stat, i) => (
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

      {/* ── NOS VALEURS ── */}
      <section className="py-20 md:py-28 bg-secondary/40 relative overflow-hidden">
        <div className="absolute end-0 top-0 bottom-0 w-2 flex flex-col overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className={`flex-1 ${i % 4 === 0 ? "bg-primary" : i % 4 === 1 ? "bg-primary/70" : i % 4 === 2 ? "bg-secondary" : "bg-primary/40"}`} />
          ))}
        </div>
        <div className="absolute start-0 top-0 bottom-0 w-2 flex flex-col overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className={`flex-1 ${i % 4 === 0 ? "bg-primary/40" : i % 4 === 1 ? "bg-secondary" : i % 4 === 2 ? "bg-primary/70" : "bg-primary"}`} />
          ))}
        </div>

        <div className="mx-auto max-w-7xl px-8 sm:px-10 lg:px-16">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-6 h-6 text-primary" />
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Nos valeurs</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Six principes fondamentaux au cœur de chaque décision que nous prenons.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* ── CHIFFRES CLÉS ── */}
      <section className="py-20 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Wslni.ma en chiffres</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              La plateforme grandit chaque jour grâce à une communauté de talents engagés.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformStats.map((stat, i) => (
              <div
                key={i}
                className="group text-center p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="text-4xl sm:text-5xl font-black text-primary mb-3 group-hover:scale-105 transition-transform">
                  {stat.value}
                </div>
                <p className="font-semibold text-foreground mb-1">{stat.label}</p>
                <p className="text-sm text-muted-foreground">{stat.sublabel}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-xs text-muted-foreground">
              Données en temps réel depuis la plateforme Wslni.ma · Mise à jour continue
            </p>
          </div>
        </div>
      </section>

      {/* ── ÉQUIPE ── */}
      <section className="py-20 md:py-24 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="w-6 h-6 text-primary" />
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">L'équipe</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Une petite équipe passionnée qui construit Wslni.ma avec cœur depuis Casablanca.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamPlaceholders.map((member, i) => (
              <div
                key={i}
                className={`group p-6 rounded-2xl border transition-all duration-300 text-center ${
                  member.name === "Bientôt"
                    ? "border-dashed border-border bg-secondary/30 hover:border-primary/30"
                    : "bg-card border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                }`}
              >
                {member.name === "Bientôt" ? (
                  <>
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-border mx-auto mb-4 flex items-center justify-center">
                      <UserCircle className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <p className="font-semibold text-muted-foreground/60 mb-1">Bientôt disponible</p>
                    <p className="text-sm text-muted-foreground/50">{member.role}</p>
                    <Link href="/carrieres" className="inline-block mt-3 text-xs text-primary hover:underline">
                      Rejoindre l'équipe
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground mx-auto mb-4 flex items-center justify-center text-lg font-bold group-hover:scale-105 transition-transform">
                      {member.initials}
                    </div>
                    <p className="font-semibold text-foreground mb-1">{member.name}</p>
                    <p className="text-sm text-primary font-medium mb-1">{member.role}</p>
                    {member.location && (
                      <p className="text-xs text-muted-foreground">{member.location}</p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button asChild variant="outline" className="border-2 hover:border-primary hover:text-primary transition-all">
              <Link href="/carrieres">
                <Handshake className="me-2 w-4 h-4" />
                Voir les postes ouverts
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/5 via-background to-secondary relative overflow-hidden">
        <svg
          className="absolute -start-20 -bottom-20 w-[26rem] h-[26rem] opacity-8 animate-float pointer-events-none"
          style={{ animationDelay: "1s" }}
          viewBox="0 0 200 200"
          fill="none"
        >
          <path d="M100 0L117.32 50L170.71 50L127.69 80.9L145.04 130.9L100 100L54.96 130.9L72.31 80.9L29.29 50L82.68 50L100 0Z" fill="currentColor" className="text-primary" />
        </svg>
        <svg
          className="absolute -end-10 top-10 w-64 h-64 opacity-8 pointer-events-none"
          viewBox="0 0 100 100"
          fill="none"
        >
          <rect x="10" y="10" width="80" height="80" rx="4" fill="currentColor" className="text-secondary" transform="rotate(45 50 50)" />
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
              <Link href="/inscription">Je cherche un talent</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
