import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Shield,
  Star,
  Heart,
  Globe,
  Lightbulb,
  Flag,
  TrendingUp,
  BookOpen,
  Users,
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
    description: "Nous construisons la plateforme que le Maroc mérite : moderne, rapide et pensée pour les usages locaux.",
  },
  {
    icon: TrendingUp,
    title: "Impact social",
    description: "Chaque commande passée sur Wslni.ma contribue à réduire le chômage et à renforcer l'économie marocaine.",
  },
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
              Lancé en 2025 · Fièrement marocain
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
                <ArrowRight className="ms-2 h-5 w-5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-2 border-foreground/20 hover:border-primary hover:text-primary transition-all px-8 py-6 text-base">
              <Link href="/comment-ca-marche">Comment ça marche</Link>
            </Button>
          </div>
        </div>
      </section>

      <ZelligeDivider />

      {/* ── NOTRE HISTOIRE ── */}
      <section className="py-20 md:py-28 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
              <span className="text-sm font-semibold uppercase tracking-widest text-primary">Notre histoire</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-8 text-balance leading-tight">
              Né d'un constat simple
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Wslni est parti d'un constat simple : il y a plein de gens compétents au Maroc qui galèrent à trouver des clients, et plein de clients qui cherchent des prestataires fiables sans savoir où regarder.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Les plateformes qui existent sont en anglais, en euros, et pensées pour d'autres marchés. Pas de darija, pas de dirhams, pas de virement local. Le support ne connaît pas la réalité marocaine.
            </p>

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
              <Link href="/services">
                Voir les services
                <ArrowRight className="ms-2 h-5 w-5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-base px-8 py-6 border-2 border-foreground/20 hover:border-primary hover:text-primary transition-all duration-300"
            >
              <Link href="/inscription">Créer mon profil</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
