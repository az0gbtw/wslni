"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, UserCircle, CreditCard, ShoppingBag, AlertTriangle, ShieldCheck, MessageSquare, ArrowRight, HelpCircle } from "lucide-react"

function ZelligeDivider() {
  return (
    <div className="w-full h-2 flex overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} className={`flex-1 h-full ${i % 4 === 0 ? "bg-primary" : i % 4 === 1 ? "bg-primary/70" : i % 4 === 2 ? "bg-secondary" : "bg-primary/40"}`} />
      ))}
    </div>
  )
}

const categories = [
  {
    id: "compte",
    icon: UserCircle,
    label: "Compte",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    questions: [
      {
        q: "Comment créer un compte sur Wslni.ma ?",
        a: "L'inscription est gratuite et prend moins de 5 minutes. Clique sur « Inscription » en haut de la page, renseigne ton adresse e-mail et crée un mot de passe. Tu peux ensuite choisir de t'inscrire comme client ou comme freelance.",
      },
      {
        q: "Comment modifier mes informations personnelles ?",
        a: "Rends-toi dans « Mon profil » depuis le menu de navigation. Tu peux y modifier ton nom, ta photo, ta biographie, tes compétences et tes coordonnées à tout moment.",
      },
      {
        q: "Comment supprimer mon compte ?",
        a: "Pour supprimer ton compte, contacte notre support à support@wslni.ma depuis l'adresse e-mail associée à ton compte. La suppression est définitive et entraîne la perte de toutes tes données, commandes et évaluations.",
      },
      {
        q: "J'ai oublié mon mot de passe. Que faire ?",
        a: "Sur la page de connexion, clique sur « Mot de passe oublié ». Saisis ton adresse e-mail et tu recevras un lien de réinitialisation dans les minutes qui suivent. Vérifie aussi ton dossier spam si tu ne reçois rien.",
      },
      {
        q: "Puis-je avoir plusieurs comptes (client et freelance) ?",
        a: "Non, un seul compte est autorisé par personne. Depuis ton espace, tu peux basculer entre le mode client et le mode freelance sans créer un second compte.",
      },
    ],
  },
  {
    id: "paiements",
    icon: CreditCard,
    label: "Paiements",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    questions: [
      {
        q: "Quels modes de paiement sont acceptés ?",
        a: "Wslni.ma accepte les cartes bancaires (Visa, Mastercard), le virement bancaire et certains portefeuilles électroniques disponibles au Maroc. Les paiements en espèces ne sont pas acceptés pour des raisons de sécurité.",
      },
      {
        q: "Comment fonctionne le système d'escrow (paiement sécurisé) ?",
        a: "Lorsque tu passes une commande, le montant est débité immédiatement et placé en séquestre sur notre plateforme. Le freelance ne reçoit le paiement qu'après ta validation de la livraison. Cela protège les deux parties.",
      },
      {
        q: "Quand est-ce que le freelance reçoit son paiement ?",
        a: "Le paiement est libéré vers le compte du freelance après que le client a validé la livraison, ou automatiquement après 7 jours si aucune réclamation n'a été soulevée. Le virement bancaire prend ensuite 1 à 3 jours ouvrables.",
      },
      {
        q: "Y a-t-il des frais de commission ?",
        a: "Wslni.ma prélève une commission de 10 % sur chaque transaction côté freelance. Il n'y a pas de frais supplémentaires pour les clients. Cette commission nous permet de financer la plateforme, le support et la sécurité des transactions.",
      },
      {
        q: "Comment obtenir un remboursement ?",
        a: "Si la livraison ne correspond pas aux termes convenus, tu peux ouvrir un litige dans les 3 jours suivant la livraison. Notre équipe analysera le cas et tranchera. En cas d'annulation avant tout début de travail, le remboursement est automatique.",
      },
    ],
  },
  {
    id: "commandes",
    icon: ShoppingBag,
    label: "Commandes",
    color: "text-violet-600 bg-violet-50 border-violet-200",
    questions: [
      {
        q: "Comment passer une commande ?",
        a: "Trouve le service qui t'intéresse, clique sur « Commander », choisis les options souhaitées et procède au paiement. Une fois la commande confirmée, le freelance reçoit une notification et peut commencer le travail.",
      },
      {
        q: "Puis-je annuler une commande en cours ?",
        a: "L'annulation est possible si le freelance n'a pas encore commencé le travail. Une fois entamé, l'annulation nécessite l'accord mutuel des deux parties ou l'ouverture d'un litige. Contacte le freelance avant toute annulation.",
      },
      {
        q: "Que faire si le freelance ne respecte pas les délais ?",
        a: "Commence par contacter le freelance via la messagerie pour obtenir une explication. S'il ne répond pas sous 48h, tu peux demander une annulation avec remboursement depuis l'espace commandes.",
      },
      {
        q: "Comment demander des révisions ?",
        a: "Chaque service précise le nombre de révisions incluses. Depuis ta commande, clique sur « Demander une révision » et décris clairement les modifications souhaitées. Les révisions supplémentaires peuvent faire l'objet d'une facturation additionnelle.",
      },
    ],
  },
  {
    id: "litiges",
    icon: AlertTriangle,
    label: "Litiges",
    color: "text-amber-600 bg-amber-50 border-amber-200",
    questions: [
      {
        q: "Comment ouvrir un litige ?",
        a: "Depuis l'espace de ta commande, clique sur « Ouvrir un litige » et décris le problème avec preuves à l'appui (captures d'écran, fichiers). Notre équipe de médiation répond sous 24 à 48h ouvrables.",
      },
      {
        q: "Dans quel délai puis-je ouvrir un litige après la livraison ?",
        a: "Tu disposes de 3 jours après avoir reçu la livraison pour ouvrir un litige. Passé ce délai, la commande est automatiquement validée et le paiement libéré au freelance.",
      },
      {
        q: "Comment fonctionne la médiation ?",
        a: "Notre équipe examine les preuves fournies par les deux parties, consulte l'historique des échanges sur la plateforme et rend une décision définitive sous 5 jours ouvrables. Cette décision peut aller du remboursement total à la libération du paiement.",
      },
      {
        q: "Que se passe-t-il si le freelance disparaît en cours de commande ?",
        a: "Si un freelance ne répond plus depuis plus de 72h alors que la commande est en cours, tu peux contacter notre support. Dans ce cas, nous procédons à une annulation et un remboursement complet.",
      },
    ],
  },
  {
    id: "securite",
    icon: ShieldCheck,
    label: "Sécurité",
    color: "text-primary bg-primary/10 border-primary/20",
    questions: [
      {
        q: "Mes données personnelles sont-elles protégées ?",
        a: "Oui. Wslni.ma est conforme au RGPD et à la loi 09-08 marocaine sur la protection des données. Tes informations ne sont jamais vendues à des tiers. Consulte notre politique de confidentialité pour les détails.",
      },
      {
        q: "Comment Wslni.ma vérifie-t-elle les freelances ?",
        a: "Chaque freelance soumet une pièce d'identité lors de l'inscription. Les profils sont également évalués par la communauté grâce au système d'avis. Les profils frauduleux signalés sont suspendus immédiatement.",
      },
      {
        q: "Comment signaler un comportement suspect ?",
        a: "Clique sur le bouton « Signaler » visible sur chaque profil ou message. Tu peux aussi nous contacter directement à support@wslni.ma. Tous les signalements sont traités de manière confidentielle.",
      },
      {
        q: "Comment activer la double authentification ?",
        a: "Dans les paramètres de ton compte, section « Sécurité », active l'authentification à deux facteurs (2FA). Tu recevras un code par SMS à chaque connexion pour sécuriser ton accès.",
      },
    ],
  },
]

export default function AidePage() {
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!query.trim()) return categories
    const q = query.toLowerCase()
    return categories
      .map((cat) => ({
        ...cat,
        questions: cat.questions.filter(
          (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.questions.length > 0)
  }, [query])

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-14 bg-gradient-to-br from-secondary via-background to-secondary/30 overflow-hidden">
        <svg className="absolute -end-16 top-8 w-64 h-64 opacity-8 animate-float pointer-events-none" viewBox="0 0 200 200" fill="none">
          <path d="M100 0L117.32 50L170.71 50L127.69 80.9L145.04 130.9L100 100L54.96 130.9L72.31 80.9L29.29 50L82.68 50L100 0Z" fill="currentColor" className="text-primary" />
        </svg>

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Centre d'aide</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
            Comment pouvons-nous{" "}
            <span className="text-primary">t'aider&nbsp;?</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Trouve une réponse à ta question parmi nos guides ou contacte notre équipe.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une question..."
              className="ps-12 h-14 text-base rounded-2xl border-2 border-border focus:border-primary bg-background shadow-sm"
            />
          </div>
        </div>
      </section>

      <ZelligeDivider />

      <section className="py-16 bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                activeCategory === null
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
              }`}
            >
              Toutes les catégories
            </button>
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              )
            })}
          </div>

          {/* No results */}
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <HelpCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium mb-2">Aucun résultat pour « {query} »</p>
              <p className="text-sm text-muted-foreground">Essaie des mots-clés différents ou contacte notre support.</p>
            </div>
          )}

          {/* Accordion by category */}
          <div className="space-y-8">
            {filtered
              .filter((cat) => activeCategory === null || cat.id === activeCategory)
              .map((cat) => {
                const Icon = cat.icon
                return (
                  <div key={cat.id} className="rounded-2xl border border-border overflow-hidden">
                    {/* Category header */}
                    <div className="flex items-center gap-3 px-6 py-4 bg-secondary/50 border-b border-border">
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${cat.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h2 className="font-semibold text-foreground">{cat.label}</h2>
                      <span className="ms-auto text-xs text-muted-foreground">{cat.questions.length} questions</span>
                    </div>

                    <div className="px-6 bg-card">
                      <Accordion type="multiple">
                        {cat.questions.map((item, i) => (
                          <AccordionItem key={i} value={`${cat.id}-${i}`}>
                            <AccordionTrigger className="text-sm font-medium text-foreground py-4 hover:no-underline hover:text-primary transition-colors">
                              {item.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                              {item.a}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </div>
                )
              })}
          </div>

          {/* Support CTA */}
          <div className="mt-16 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-center relative overflow-hidden">
            <svg className="absolute -end-10 -top-10 w-48 h-48 opacity-10 pointer-events-none" viewBox="0 0 200 200" fill="currentColor">
              <path d="M100 0L117.32 50L170.71 50L127.69 80.9L145.04 130.9L100 100L54.96 130.9L72.31 80.9L29.29 50L82.68 50L100 0Z" />
            </svg>
            <div className="relative z-10">
              <MessageSquare className="w-10 h-10 mx-auto mb-4 opacity-80" />
              <h3 className="text-xl font-bold mb-2">Tu n'as pas trouvé ta réponse&nbsp;?</h3>
              <p className="text-primary-foreground/75 mb-6 max-w-sm mx-auto">
                Notre équipe de support est disponible du lundi au vendredi, de 9h à 18h (GMT+1). Nous répondons en moins de 24h.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold"
              >
                <Link href="/contact">
                  Contacter le support
                  <ArrowRight className="ms-2 w-4 h-4 rtl:rotate-180" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
