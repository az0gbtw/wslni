import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  Briefcase,
  Rocket,
  Heart,
  Globe,
  Zap,
  Users,
  TrendingUp,
  CheckCircle,
  MapPin,
  Clock,
} from "lucide-react"

function ZelligeDivider() {
  return (
    <div className="w-full h-2 flex overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} className={`flex-1 h-full ${i % 4 === 0 ? "bg-primary" : i % 4 === 1 ? "bg-primary/70" : i % 4 === 2 ? "bg-secondary" : "bg-primary/40"}`} />
      ))}
    </div>
  )
}

const perks = [
  {
    icon: Rocket,
    title: "Mission qui a du sens",
    description: "Tu travailles pour réduire le chômage des jeunes au Maroc et construire un outil concret d'émancipation économique.",
  },
  {
    icon: Globe,
    title: "Travail flexible",
    description: "Full remote ou hybride selon le poste, avec des horaires adaptés. Nous faisons confiance à notre équipe.",
  },
  {
    icon: TrendingUp,
    title: "Croissance rapide",
    description: "Une startup en phase de lancement = des responsabilités réelles, un impact direct et une progression rapide.",
  },
  {
    icon: Heart,
    title: "Équipe bienveillante",
    description: "Une petite équipe soudée, ambitieuse et passionnée qui se soutient mutuellement et célèbre chaque victoire.",
  },
]

const values = [
  "Impact local d'abord",
  "Transparence radicale",
  "Excellence dans l'exécution",
  "Bienveillance & respect",
  "Itérer vite et apprendre",
]

export default function CarrieresPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-secondary via-background to-secondary/30 overflow-hidden">
        <svg className="absolute -end-16 top-8 w-72 h-72 opacity-8 animate-float pointer-events-none" viewBox="0 0 200 200" fill="none">
          <path d="M100 0L117.32 50L170.71 50L127.69 80.9L145.04 130.9L100 100L54.96 130.9L72.31 80.9L29.29 50L82.68 50L100 0Z" fill="currentColor" className="text-primary" />
        </svg>

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Briefcase className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Rejoins l'équipe</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-5 text-balance">
            Construis l'avenir du travail{" "}
            <span className="text-primary">freelance au Maroc</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Wslni.ma est une startup marocaine en pleine croissance. Rejoins une équipe passionnée qui construit un produit à impact réel pour des milliers de jeunes talents.
          </p>
        </div>
      </section>

      <ZelligeDivider />

      {/* Open Positions */}
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Postes ouverts</h2>
            </div>
            <p className="text-muted-foreground">Les opportunités disponibles au sein de l'équipe Wslni.ma.</p>
          </div>

          {/* Empty state — no open positions */}
          <div className="rounded-2xl border-2 border-dashed border-border bg-secondary/30 p-12 text-center mb-16">
            <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center mx-auto mb-5">
              <Briefcase className="w-7 h-7 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Aucun poste ouvert pour le moment</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-5 text-sm">
              Nous n'avons pas de poste à pourvoir actuellement, mais nous grandissons vite. Envoie-nous une candidature spontanée ci-dessous et nous te contacterons dès qu'un poste correspond à ton profil.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background border border-border text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                Casablanca / Remote
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background border border-border text-sm text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                Temps plein & temps partiel
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background border border-border text-sm text-muted-foreground">
                <Zap className="w-3.5 h-3.5" />
                Stage & CDI
              </span>
            </div>
          </div>

          {/* Why join us */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Heart className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Pourquoi nous rejoindre&nbsp;?</h2>
              </div>
              <p className="text-muted-foreground">Ce que tu gagneras en faisant partie de l'aventure Wslni.ma.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {perks.map((perk, i) => {
                const Icon = perk.icon
                return (
                  <div
                    key={i}
                    className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{perk.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{perk.description}</p>
                  </div>
                )
              })}
            </div>

            {/* Values pills */}
            <div className="mt-8 p-6 rounded-2xl bg-secondary/50 border border-border">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Nos valeurs d'équipe</p>
              <div className="flex flex-wrap gap-2">
                {values.map((v, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-background border border-border text-sm font-medium text-foreground"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-primary" />
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Spontaneous application form */}
          <div id="candidature">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Candidature spontanée</h2>
              </div>
              <p className="text-muted-foreground">
                Pas de poste ouvert qui te correspond&nbsp;? Envoie-nous ton profil, nous reviendrons vers toi dès que possible.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-secondary/30 p-10 text-center">
              <p className="text-muted-foreground">
                Les candidatures sont temporairement fermées. Revenez bientôt.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
