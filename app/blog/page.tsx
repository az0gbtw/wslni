import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Clock, Calendar, ArrowRight, BookOpen, Rss } from "lucide-react"

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

const categories = ["Tous", "Conseils", "Freelance", "Business", "Tech", "Maroc"]

const articles = [
  {
    category: "Freelance",
    categoryClass: "bg-primary/10 text-primary border-primary/20",
    title: "Comment fixer ses tarifs en tant que freelance marocain",
    excerpt: "La tarification est le défi numéro un des freelances débutants. Voici une méthode éprouvée pour trouver le bon prix selon votre marché.",
    readTime: "6 min",
    date: "10 jan. 2024",
  },
  {
    category: "Business",
    categoryClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    title: "De freelance solo à agence : l'histoire de Karim, dev à Casablanca",
    excerpt: "En trois ans, Karim a transformé son activité individuelle en une petite agence. Il partage les décisions clés qui ont tout changé.",
    readTime: "5 min",
    date: "5 jan. 2024",
  },
  {
    category: "Tech",
    categoryClass: "bg-violet-50 text-violet-700 border-violet-200",
    title: "Les 10 compétences les plus demandées sur Wslni.ma en 2024",
    excerpt: "Analyse des données de la plateforme : quelles compétences génèrent le plus de commandes et les meilleures rémunérations ?",
    readTime: "4 min",
    date: "1 jan. 2024",
  },
  {
    category: "Maroc",
    categoryClass: "bg-amber-50 text-amber-700 border-amber-200",
    title: "L'essor de l'économie numérique au Maroc : chiffres et perspectives",
    excerpt: "Le secteur du numérique représente désormais 4 % du PIB marocain. Quelles opportunités pour les freelances locaux ?",
    readTime: "7 min",
    date: "28 déc. 2023",
  },
  {
    category: "Conseils",
    categoryClass: "bg-blue-50 text-blue-700 border-blue-200",
    title: "Créer un portfolio qui attire des clients premium",
    excerpt: "Votre portfolio est votre vitrine. Découvrez les éléments qui font la différence entre un profil ordinaire et un profil qui convertit.",
    readTime: "5 min",
    date: "22 déc. 2023",
  },
  {
    category: "Freelance",
    categoryClass: "bg-primary/10 text-primary border-primary/20",
    title: "Gérer sa comptabilité en tant que freelance au Maroc",
    excerpt: "Auto-entrepreneur, société, imposition... Les aspects légaux et fiscaux du freelancing marocain expliqués simplement.",
    readTime: "9 min",
    date: "15 déc. 2023",
  },
]

export default function BlogPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-secondary via-background to-secondary/30 overflow-hidden">
        <svg
          className="absolute -end-20 top-10 w-80 h-80 opacity-8 animate-float pointer-events-none"
          viewBox="0 0 200 200"
          fill="none"
        >
          <path
            d="M100 0L117.32 50L170.71 50L127.69 80.9L145.04 130.9L100 100L54.96 130.9L72.31 80.9L29.29 50L82.68 50L100 0Z"
            fill="currentColor"
            className="text-primary"
          />
        </svg>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Blog Wslni.ma</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
            Ressources & inspiration pour les{" "}
            <span className="text-primary">freelances marocains</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Conseils pratiques, témoignages et analyses du marché freelance marocain. Tout ce dont tu as besoin pour développer ton activité.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {categories.map((cat, i) => (
              <button
                key={cat}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  i === 0
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-background border border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <ZelligeDivider />

      <section className="py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Featured Article */}
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">Article à la une</p>
          <div className="relative mb-14 rounded-3xl overflow-hidden bg-gradient-to-br from-foreground to-foreground/80 text-primary-foreground p-8 sm:p-12">
            <svg
              className="absolute -end-8 -top-8 w-56 h-56 opacity-5 pointer-events-none"
              viewBox="0 0 200 200"
              fill="currentColor"
            >
              <path d="M100 0L117.32 50L170.71 50L127.69 80.9L145.04 130.9L100 100L54.96 130.9L72.31 80.9L29.29 50L82.68 50L100 0Z" />
            </svg>

            <div className="relative z-10 max-w-3xl">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full text-xs font-semibold border border-primary-foreground/30 bg-primary-foreground/15">
                  Freelance
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground/70">
                  Bientôt disponible
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-balance leading-tight">
                Comment réussir en tant que freelance au Maroc en 2024
              </h2>
              <p className="text-primary-foreground/70 text-lg leading-relaxed mb-8">
                Le marché du travail indépendant au Maroc connaît une transformation majeure. Découvrez les stratégies des freelances qui réussissent le mieux et comment vous pouvez les appliquer à votre propre activité dès aujourd'hui.
              </p>
              <div className="flex flex-wrap items-center gap-6 text-sm text-primary-foreground/60">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  8 min de lecture
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  15 janvier 2024
                </span>
                <span>Équipe Wslni</span>
              </div>
            </div>
          </div>

          {/* Articles Grid */}
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">Derniers articles</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {articles.map((article, i) => (
              <div
                key={i}
                className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="h-44 bg-gradient-to-br from-secondary to-secondary/50 relative flex items-center justify-center">
                  <svg className="w-14 h-14 opacity-10 text-primary" viewBox="0 0 200 200" fill="currentColor">
                    <path d="M100 0L117.32 50L170.71 50L127.69 80.9L145.04 130.9L100 100L54.96 130.9L72.31 80.9L29.29 50L82.68 50L100 0Z" />
                  </svg>
                  <div className="absolute top-3 start-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${article.categoryClass}`}>
                      {article.category}
                    </span>
                  </div>
                  <div className="absolute top-3 end-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-background/80 backdrop-blur-sm text-muted-foreground border border-border">
                      Bientôt
                    </span>
                  </div>
                </div>

                <div className="flex flex-col flex-1 p-5">
                  <h3 className="font-semibold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {article.readTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {article.date}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Newsletter CTA */}
          <div className="text-center p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-secondary/60 to-secondary/20 border border-border relative overflow-hidden">
            <svg
              className="absolute -start-10 bottom-0 w-48 h-48 opacity-8 pointer-events-none text-primary"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <rect x="10" y="10" width="80" height="80" rx="4" transform="rotate(45 50 50)" />
            </svg>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-5">
                <Rss className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Bientôt disponible</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Le blog arrive bientôt
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Nous préparons des contenus de qualité pour t'aider à développer ton activité freelance. Inscris-toi pour être parmi les premiers à les lire.
              </p>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                M'avertir à la sortie
                <ArrowRight className="ms-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
