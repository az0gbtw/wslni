import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Shield } from "lucide-react"

function ZelligeDivider() {
  return (
    <div className="w-full h-2 flex overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} className={`flex-1 h-full ${i % 4 === 0 ? "bg-primary" : i % 4 === 1 ? "bg-primary/70" : i % 4 === 2 ? "bg-secondary" : "bg-primary/40"}`} />
      ))}
    </div>
  )
}

const sections = [
  {
    number: "01",
    title: "Ce qu'on collecte",
    body: (
      <p>
        Quand tu crées un compte, on récupère ton <strong className="text-foreground">nom</strong> et ton{" "}
        <strong className="text-foreground">adresse e-mail</strong>. Le reste — photo de profil, bio, compétences,
        portfolio — c'est toi qui choisis ce que tu veux partager.
      </p>
    ),
  },
  {
    number: "02",
    title: "Pourquoi on les utilise",
    body: (
      <p>
        Pour faire tourner la plateforme, tout simplement. Ça couvre la connexion à ton compte, la gestion de tes
        commandes, et la messagerie avec les autres utilisateurs. On n'utilise pas tes données à d'autres fins.
      </p>
    ),
  },
  {
    number: "03",
    title: "Ce qu'on ne fait pas",
    body: (
      <p>
        On ne vend pas tes données. On ne les partage pas avec des tiers, sauf si c'est strictement nécessaire
        pour faire fonctionner le service — par exemple, le prestataire qui traite les paiements. Dans ce cas, ils
        n'y ont accès qu'à ce dont ils ont besoin, rien de plus.
      </p>
    ),
  },
  {
    number: "04",
    title: "Tes droits",
    body: (
      <p>
        Tu peux demander la suppression de ton compte et de toutes tes données à tout moment. Il suffit de nous
        contacter à{" "}
        <a href="mailto:support@wslni.ma" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
          support@wslni.ma
        </a>{" "}
        et on s'en occupe rapidement.
      </p>
    ),
  },
]

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-secondary via-background to-secondary/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Confidentialité</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Tes données, en clair.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            On fait simple : voilà ce qu'on collecte, pourquoi, et ce qu'on ne fait pas avec.
          </p>
        </div>
      </section>

      <ZelligeDivider />

      <section className="py-16 bg-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-10">
            {sections.map((sec) => (
              <div key={sec.number} className="flex gap-6 sm:gap-8">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary font-mono">{sec.number}</span>
                </div>
                <div className="flex-1 pt-1.5">
                  <h2 className="text-lg font-bold text-foreground mb-3">{sec.title}</h2>
                  <div className="text-muted-foreground leading-relaxed">{sec.body}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 p-5 rounded-2xl bg-secondary/40 border border-border">
            <p className="text-sm text-muted-foreground">
              Des questions ? Écris-nous à{" "}
              <a href="mailto:support@wslni.ma" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
                support@wslni.ma
              </a>
              . On répond vite.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
