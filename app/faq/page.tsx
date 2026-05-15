"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, HelpCircle, ArrowRight, MessageSquare } from "lucide-react"

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
    id: "general",
    label: "Général",
    questions: [
      {
        q: "Qu'est-ce que Wslni.ma ?",
        a: "Wslni.ma est la première marketplace freelance 100 % marocaine. Elle connecte des clients (entreprises, startups, particuliers) avec des freelances qualifiés pour des missions ponctuelles ou régulières dans des domaines variés : design, développement, marketing, rédaction, et plus encore.",
      },
      {
        q: "Wslni.ma est-il gratuit ?",
        a: "L'inscription et la consultation des profils sont totalement gratuites pour tout le monde. Wslni.ma prélève une commission de 10 % sur les transactions des freelances. Il n'y a aucun frais d'abonnement mensuel.",
      },
      {
        q: "Dans quelles villes du Maroc Wslni.ma est-il disponible ?",
        a: "Wslni.ma fonctionne sur tout le territoire marocain. Toutes les prestations étant réalisées en ligne, la localisation n'est pas un obstacle. Des freelances de Casablanca, Rabat, Marrakech, Fès, Agadir et de toutes les régions du pays sont présents sur la plateforme.",
      },
      {
        q: "Wslni.ma est-il disponible en arabe ?",
        a: "Oui. Wslni.ma supporte le français et l'arabe. Tu peux changer la langue depuis le menu de navigation. L'ensemble de l'interface et du support est disponible dans les deux langues.",
      },
      {
        q: "Comment Wslni.ma se différencie-t-il de Fiverr ou Upwork ?",
        a: "Wslni.ma est conçu spécifiquement pour le marché marocain. Les prix sont adaptés au pouvoir d'achat local, le support est en français et en arabe, les transactions sont sécurisées selon la réglementation marocaine, et la communauté est 100 % locale.",
      },
    ],
  },
  {
    id: "freelances",
    label: "Freelances",
    questions: [
      {
        q: "Comment devenir freelance sur Wslni.ma ?",
        a: "Crée un compte, puis remplis ton profil en ajoutant tes compétences, ton expérience et des exemples de ton travail. Soumets ensuite une pièce d'identité pour vérification. Une fois validé (sous 24h), tu peux publier tes premiers services.",
      },
      {
        q: "Quels types de services puis-je proposer ?",
        a: "Tous les services numériques sont acceptés : design graphique, développement web et mobile, marketing digital, rédaction, traduction, vidéo, musique, consulting, formation, et bien d'autres. Les services impliquant une prestation physique exclusive sont exclus.",
      },
      {
        q: "Comment fixer mes tarifs ?",
        a: "Tu fixes tes propres tarifs librement. Nous te recommandons de consulter les profils similaires pour te situer, de commencer légèrement en dessous du marché pour accumuler tes premiers avis, puis d'augmenter progressivement selon ta réputation.",
      },
      {
        q: "Combien de services puis-je publier ?",
        a: "Durant la phase de lancement, chaque freelance peut publier jusqu'à 10 services actifs simultanément. Cette limite sera revue à la hausse pour les freelances avec de bonnes évaluations.",
      },
      {
        q: "Comment augmenter ma visibilité sur la plateforme ?",
        a: "Complète ton profil à 100 %, ajoute de bons exemples de travail dans ton portfolio, réponds rapidement aux messages, maintiens un taux de satisfaction élevé et accumule des avis positifs. Les profils complets et bien évalués sont mis en avant dans les résultats de recherche.",
      },
    ],
  },
  {
    id: "clients",
    label: "Clients",
    questions: [
      {
        q: "Comment trouver le bon freelance pour mon projet ?",
        a: "Utilise la barre de recherche avec des mots-clés pertinents ou parcours les catégories. Filtre par budget, délai, évaluation et spécialité. Tu peux aussi publier un appel d'offres et recevoir des propositions de freelances intéressés.",
      },
      {
        q: "Comment savoir si un freelance est fiable ?",
        a: "Consulte son profil complet : photo, biographie, portfolio, évaluations et commentaires des clients précédents. Un badge « Vérifié » indique que l'identité du freelance a été contrôlée par notre équipe.",
      },
      {
        q: "Puis-je discuter avec un freelance avant de commander ?",
        a: "Oui. La messagerie est accessible depuis chaque profil. Tu peux poser tes questions, partager les détails de ton projet et obtenir une offre personnalisée avant de t'engager.",
      },
      {
        q: "Que faire si le travail livré ne me convient pas ?",
        a: "Demande d'abord des révisions dans le cadre prévu par la commande. Si le freelance refuse ou que la livraison reste non conforme après révision, tu peux ouvrir un litige dans les 3 jours suivant la livraison. Notre équipe interviendra comme médiateur.",
      },
    ],
  },
  {
    id: "paiements",
    label: "Paiements",
    questions: [
      {
        q: "Quels modes de paiement sont acceptés ?",
        a: "Wslni.ma accepte les cartes bancaires (Visa, Mastercard), le virement bancaire marocain et certains portefeuilles électroniques. D'autres méthodes de paiement seront ajoutées progressivement.",
      },
      {
        q: "Mon paiement est-il sécurisé ?",
        a: "Oui. Lorsque tu passes une commande, le montant est placé en séquestre (escrow) et n'est versé au freelance qu'après ta validation de la livraison. Si un problème survient, le montant peut être remboursé selon les résultats de la médiation.",
      },
      {
        q: "Quand et comment le freelance est-il payé ?",
        a: "Le paiement est libéré après validation par le client, ou automatiquement 7 jours après livraison si aucun litige n'est ouvert. Le virement vers le compte bancaire marocain du freelance prend 1 à 3 jours ouvrables.",
      },
      {
        q: "Y a-t-il des frais supplémentaires pour les clients ?",
        a: "Non. Les clients paient uniquement le montant affiché sur la fiche du service. Aucun frais de service ni frais cachés ne sont appliqués côté client.",
      },
    ],
  },
  {
    id: "securite",
    label: "Sécurité",
    questions: [
      {
        q: "Comment Wslni.ma protège-t-il mes données personnelles ?",
        a: "Wslni.ma est conforme à la loi marocaine 09-08 sur la protection des données personnelles. Tes informations sont chiffrées, hébergées sur des serveurs sécurisés et ne sont jamais revendues à des tiers. Consulte notre politique de confidentialité pour tous les détails.",
      },
      {
        q: "Comment signaler un utilisateur suspect ou un contenu inapproprié ?",
        a: "Clique sur le bouton « Signaler » présent sur chaque profil ou message. Tu peux aussi nous écrire à security@wslni.ma. Tous les signalements sont traités de manière confidentielle et dans les meilleurs délais.",
      },
      {
        q: "Que faire si je pense que mon compte a été piraté ?",
        a: "Change immédiatement ton mot de passe et contacte notre support à support@wslni.ma. Nous pouvons bloquer temporairement l'accès à ton compte et t'aider à sécuriser ta session.",
      },
      {
        q: "Les paiements sont-ils conformes à la réglementation marocaine ?",
        a: "Oui. Wslni.ma est enregistré au Maroc et respecte la réglementation de Bank Al-Maghrib en matière de paiement électronique. Toutes les transactions sont tracées et conformes aux obligations légales.",
      },
    ],
  },
]

export default function FaqPage() {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    if (!query.trim()) return sections
    const q = query.toLowerCase()
    return sections
      .map((sec) => ({
        ...sec,
        questions: sec.questions.filter(
          (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
        ),
      }))
      .filter((sec) => sec.questions.length > 0)
  }, [query])

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-14 bg-gradient-to-br from-secondary via-background to-secondary/30 overflow-hidden">
        <svg className="absolute -end-16 top-8 w-64 h-64 opacity-8 animate-float pointer-events-none" viewBox="0 0 200 200" fill="none">
          <path d="M100 0L117.32 50L170.71 50L127.69 80.9L145.04 130.9L100 100L54.96 130.9L72.31 80.9L29.29 50L82.68 50L100 0Z" fill="currentColor" className="text-primary" />
        </svg>
        <svg className="absolute -start-12 bottom-0 w-48 h-48 opacity-6 pointer-events-none" viewBox="0 0 100 100" fill="none">
          <rect x="10" y="10" width="80" height="80" rx="4" fill="currentColor" className="text-secondary" transform="rotate(45 50 50)" />
        </svg>

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Questions fréquentes</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
            Toutes vos questions,{" "}
            <span className="text-primary">une seule page</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Retrouve les réponses aux questions les plus posées sur Wslni.ma.
          </p>

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
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Section nav pills */}
          {!query && (
            <div className="flex flex-wrap gap-2 mb-10">
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="px-4 py-1.5 rounded-full text-sm font-medium border border-border text-muted-foreground bg-background hover:border-primary/40 hover:text-primary transition-all"
                >
                  {sec.label}
                </a>
              ))}
            </div>
          )}

          {/* No results */}
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <HelpCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium mb-2">Aucun résultat pour « {query} »</p>
              <p className="text-sm text-muted-foreground">Essaie des mots-clés différents ou contacte notre support.</p>
            </div>
          )}

          {/* FAQ Sections */}
          <div className="space-y-12">
            {filtered.map((sec) => (
              <div key={sec.id} id={sec.id}>
                <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                  <span className="w-1.5 h-6 rounded-full bg-primary inline-block" />
                  {sec.label}
                </h2>
                <div className="rounded-2xl border border-border overflow-hidden bg-card">
                  <Accordion type="multiple">
                    {sec.questions.map((item, i) => (
                      <AccordionItem key={i} value={`${sec.id}-${i}`} className="px-6">
                        <AccordionTrigger className="text-sm font-medium text-foreground py-4 hover:no-underline hover:text-primary transition-colors text-start">
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
            ))}
          </div>

          {/* Support CTA */}
          <div className="mt-16 p-8 rounded-2xl bg-secondary/60 border border-border text-center">
            <MessageSquare className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-bold text-foreground mb-2">Tu n'as pas trouvé ta réponse&nbsp;?</h3>
            <p className="text-muted-foreground text-sm mb-5">
              Notre équipe répond en moins de 24h du lundi au vendredi.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/contact">
                  Contacter le support
                  <ArrowRight className="ms-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 hover:border-primary hover:text-primary transition-all">
                <Link href="/aide">Centre d'aide complet</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
