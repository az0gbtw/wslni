import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

const principles = [
  {
    title: "Des prix en dirhams",
    description:
      "Les tarifs sont affichés en MAD, avec des formules claires et un délai annoncé sur chaque service.",
  },
  {
    title: "Une vérification d'identité, si tu veux",
    description:
      "Un freelance peut envoyer sa CIN pour être vérifié. Quand c'est validé, un badge apparaît sur son profil.",
  },
  {
    title: "Les échanges se font sur la plateforme",
    description:
      "Les messages passent par Wslni, dans la commande. C'est plus simple pour s'y retrouver, des deux côtés.",
  },
]

export default function AProposPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* ── HERO ── */}
      <section className="pt-32 pb-16 md:pb-20 bg-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-6 text-balance">
            Aider les freelances marocains à trouver des clients
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
            Wslni.ma est une marketplace faite au Maroc, lancée en 2026. Le projet est jeune : on construit, on corrige, et on écoute ceux qui l'utilisent.
          </p>
        </div>
      </section>

      {/* ── POURQUOI ── */}
      <section className="py-16 md:py-20 bg-background border-t border-gray-100">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-balance leading-tight">
            Pourquoi on a lancé Wslni
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-6">
            Wslni est parti d'un constat simple : il y a plein de gens compétents au Maroc qui galèrent à trouver des clients, et plein de clients qui cherchent des prestataires fiables sans savoir où regarder.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Les plateformes qui existent sont en anglais, en euros, et pensées pour d'autres marchés. Pas de darija, pas de dirhams, pas de virement local. Le support ne connaît pas la réalité marocaine.
          </p>
        </div>
      </section>

      {/* ── CE À QUOI ON TIENT ── */}
      <section className="py-16 md:py-20 bg-secondary/40">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8">Ce à quoi on tient</h2>

          <div className="border-t border-border">
            {principles.map((p) => (
              <div key={p.title} className="grid md:grid-cols-[1fr_2fr] gap-2 md:gap-10 py-6 border-b border-border">
                <h3 className="font-semibold text-foreground">{p.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 md:py-20 bg-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">Envie d'essayer&nbsp;?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl text-pretty">
            Que tu cherches un freelance ou que tu veuilles proposer tes services, l'inscription est gratuite.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg">
              <Link href="/services">Voir les services</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/inscription">Créer mon profil</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
