"use client"

import { useEffect, useRef, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { FileText, Calendar } from "lucide-react"

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
  { id: "s1", number: "1.", title: "Objet et champ d'application" },
  { id: "s2", number: "2.", title: "Inscription et compte utilisateur" },
  { id: "s3", number: "3.", title: "Règles de la plateforme" },
  { id: "s4", number: "4.", title: "Commandes et paiements" },
  { id: "s5", number: "5.", title: "Politique d'annulation et remboursement" },
  { id: "s6", number: "6.", title: "Commission et frais" },
  { id: "s7", number: "7.", title: "Propriété intellectuelle" },
  { id: "s8", number: "8.", title: "Responsabilité" },
  { id: "s9", number: "9.", title: "Suspension et résiliation" },
  { id: "s10", number: "10.", title: "Modification des CGU" },
  { id: "s11", number: "11.", title: "Droit applicable et litiges" },
]

export default function ConditionsPage() {
  const [active, setActive] = useState("s1")
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        })
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    )

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id)
      if (el) {
        sectionRefs.current[sec.id] = el
        observer.observe(el)
      }
    })

    return () => observer.disconnect()
  }, [])

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-secondary via-background to-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Documents légaux</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Conditions Générales d'Utilisation
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Dernière mise à jour : 1er janvier 2024
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>Version 1.0</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>Applicable au Maroc</span>
          </div>
        </div>
      </section>

      <ZelligeDivider />

      <section className="py-12 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-4 lg:gap-12">
            {/* Sidebar TOC */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Table des matières</p>
                <nav className="space-y-1">
                  {sections.map((sec) => (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      onClick={(e) => { e.preventDefault(); document.getElementById(sec.id)?.scrollIntoView({ behavior: "smooth", block: "start" }) }}
                      className={`flex items-start gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        active === sec.id
                          ? "bg-primary/10 text-primary font-medium border-s-2 border-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                      }`}
                    >
                      <span className="shrink-0 font-mono text-xs mt-0.5 opacity-60">{sec.number}</span>
                      <span>{sec.title}</span>
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <div className="lg:col-span-3 prose-sm prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed max-w-none">
              {/* Preamble */}
              <div className="p-6 rounded-2xl bg-secondary/40 border border-border mb-10">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'accès et l'utilisation de la plateforme Wslni.ma, opérée par la société <strong className="text-foreground">Wslni SARL</strong>, société à responsabilité limitée de droit marocain. En accédant à la plateforme, tu acceptes l'intégralité des présentes CGU. Si tu n'acceptes pas ces conditions, tu dois cesser d'utiliser la plateforme.
                </p>
              </div>

              <div className="space-y-12">
                <section id="s1" className="scroll-mt-28">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-primary font-mono text-base">1.</span>
                    Objet et champ d'application
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Wslni.ma est une marketplace en ligne permettant la mise en relation entre des clients (personnes physiques ou morales souhaitant commander des prestations de services) et des freelances (personnes physiques ou morales proposant leurs services).
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    La plateforme intervient en qualité d'intermédiaire technique et ne devient partie à aucun contrat de prestation de services conclu entre les clients et les freelances. Chaque transaction est conclue directement entre le client et le freelance concerné.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Les présentes CGU s'appliquent à toute personne physique ou morale qui crée un compte sur Wslni.ma ou qui utilise la plateforme, quel que soit son mode d'accès (web, application mobile, API).
                  </p>
                </section>

                <section id="s2" className="scroll-mt-28">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-primary font-mono text-base">2.</span>
                    Inscription et compte utilisateur
                  </h2>
                  <div className="space-y-3 text-muted-foreground leading-relaxed">
                    <p><strong className="text-foreground">2.1 Conditions d'éligibilité.</strong> Pour s'inscrire sur Wslni.ma, tu dois être âgé d'au moins 18 ans ou, si tu es mineur, disposer du consentement écrit d'un représentant légal. Tu dois être en mesure de conclure des contrats valides selon le droit marocain.</p>
                    <p><strong className="text-foreground">2.2 Identité réelle.</strong> Chaque utilisateur ne peut posséder qu'un seul compte. Les informations fournies lors de l'inscription doivent être exactes, complètes et à jour. Wslni.ma se réserve le droit de demander des justificatifs d'identité à tout moment.</p>
                    <p><strong className="text-foreground">2.3 Sécurité du compte.</strong> Tu es seul responsable de la confidentialité de tes identifiants de connexion. Toute action effectuée depuis ton compte sous tes identifiants est réputée effectuée par toi. Signale immédiatement tout accès non autorisé à notre support.</p>
                    <p><strong className="text-foreground">2.4 Vérification d'identité.</strong> Les freelances sont tenus de soumettre une pièce d'identité valide pour accéder aux fonctionnalités de paiement. Cette vérification est effectuée dans le respect de la législation marocaine en matière de lutte contre le blanchiment d'argent.</p>
                  </div>
                </section>

                <section id="s3" className="scroll-mt-28">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-primary font-mono text-base">3.</span>
                    Règles de la plateforme
                  </h2>
                  <div className="space-y-3 text-muted-foreground leading-relaxed">
                    <p><strong className="text-foreground">3.1 Comportement attendu.</strong> Les utilisateurs s'engagent à adopter un comportement respectueux, honnête et professionnel envers les autres membres de la communauté Wslni.ma.</p>
                    <p><strong className="text-foreground">3.2 Contenus interdits.</strong> Il est strictement interdit de publier des contenus illégaux, diffamatoires, frauduleux, trompeurs, obscènes ou portant atteinte aux droits de tiers. Wslni.ma se réserve le droit de supprimer tout contenu non conforme sans préavis.</p>
                    <p><strong className="text-foreground">3.3 Transactions hors plateforme.</strong> Il est formellement interdit de contourner la plateforme en proposant ou en acceptant des paiements directs en dehors du système Wslni.ma. Toute violation entraîne la suspension immédiate du compte.</p>
                    <p><strong className="text-foreground">3.4 Services autorisés.</strong> Seules les prestations de services numériques légaux sont autorisées sur la plateforme. Les services impliquant des activités illicites selon le droit marocain sont strictement prohibés.</p>
                  </div>
                </section>

                <section id="s4" className="scroll-mt-28">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-primary font-mono text-base">4.</span>
                    Commandes et paiements
                  </h2>
                  <div className="space-y-3 text-muted-foreground leading-relaxed">
                    <p><strong className="text-foreground">4.1 Processus de commande.</strong> La commande est ferme et définitive dès que le client confirme et que le paiement est accepté par notre système. Le freelance est notifié immédiatement et dispose d'un délai de 24 heures pour accepter ou décliner la commande.</p>
                    <p><strong className="text-foreground">4.2 Système d'escrow.</strong> Le montant payé par le client est placé en séquestre sur un compte dédié géré par Wslni.ma. Ce montant n'est versé au freelance qu'après validation de la livraison par le client ou expiration du délai de contestation.</p>
                    <p><strong className="text-foreground">4.3 Délai de validation.</strong> Le client dispose de 7 jours après la livraison pour valider, demander des révisions ou ouvrir un litige. Passé ce délai, la commande est automatiquement validée et le paiement libéré.</p>
                    <p><strong className="text-foreground">4.4 Monnaie.</strong> Toutes les transactions sur Wslni.ma sont effectuées en Dirham marocain (MAD). Les prix affichés sont toutes taxes comprises (TTC) sauf mention contraire.</p>
                  </div>
                </section>

                <section id="s5" className="scroll-mt-28">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-primary font-mono text-base">5.</span>
                    Politique d'annulation et remboursement
                  </h2>
                  <div className="space-y-3 text-muted-foreground leading-relaxed">
                    <p><strong className="text-foreground">5.1 Annulation avant démarrage.</strong> Si le freelance n'a pas encore démarré la commande, l'annulation est possible à la demande du client avec remboursement intégral.</p>
                    <p><strong className="text-foreground">5.2 Annulation en cours de commande.</strong> Une fois le travail commencé, l'annulation nécessite l'accord des deux parties. En cas de désaccord, un litige doit être ouvert pour arbitrage par l'équipe Wslni.ma.</p>
                    <p><strong className="text-foreground">5.3 Remboursement suite à litige.</strong> En cas de litige tranché en faveur du client, le remboursement est effectué sur le moyen de paiement d'origine dans un délai de 5 à 10 jours ouvrables.</p>
                    <p><strong className="text-foreground">5.4 Non-remboursement de la commission.</strong> La commission de la plateforme n'est pas remboursée en cas d'annulation, sauf si l'annulation est due à une erreur technique de Wslni.ma.</p>
                  </div>
                </section>

                <section id="s6" className="scroll-mt-28">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-primary font-mono text-base">6.</span>
                    Commission et frais
                  </h2>
                  <div className="space-y-3 text-muted-foreground leading-relaxed">
                    <p><strong className="text-foreground">6.1 Commission freelance.</strong> Wslni.ma prélève une commission de <strong className="text-foreground">10 %</strong> sur le montant hors taxes de chaque transaction réalisée par un freelance. Cette commission est prélevée automatiquement lors du versement du paiement.</p>
                    <p><strong className="text-foreground">6.2 Frais clients.</strong> L'utilisation de la plateforme est gratuite pour les clients. Aucun frais de service n'est ajouté au montant du service commandé.</p>
                    <p><strong className="text-foreground">6.3 Frais bancaires.</strong> Des frais de traitement bancaire peuvent s'appliquer selon le moyen de paiement utilisé. Ces frais sont indiqués lors du processus de paiement.</p>
                  </div>
                </section>

                <section id="s7" className="scroll-mt-28">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-primary font-mono text-base">7.</span>
                    Propriété intellectuelle
                  </h2>
                  <div className="space-y-3 text-muted-foreground leading-relaxed">
                    <p><strong className="text-foreground">7.1 Droits du client.</strong> Sauf accord contraire entre les parties, le client obtient les droits d'utilisation complets sur la livraison après paiement intégral de la commande.</p>
                    <p><strong className="text-foreground">7.2 Portfolio freelance.</strong> Le freelance peut conserver le droit d'utiliser la livraison dans son portfolio à des fins promotionnelles, sauf accord de confidentialité explicite avec le client.</p>
                    <p><strong className="text-foreground">7.3 Propriété de Wslni.ma.</strong> L'ensemble des éléments de la plateforme (logo, interface, code source, algorithmes, base de données) sont la propriété exclusive de Wslni SARL et sont protégés par le droit marocain de la propriété intellectuelle.</p>
                  </div>
                </section>

                <section id="s8" className="scroll-mt-28">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-primary font-mono text-base">8.</span>
                    Responsabilité
                  </h2>
                  <div className="space-y-3 text-muted-foreground leading-relaxed">
                    <p><strong className="text-foreground">8.1 Rôle d'intermédiaire.</strong> Wslni.ma agit en qualité d'intermédiaire technique et n'est pas responsable de la qualité des prestations fournies par les freelances ni des dommages pouvant résulter des transactions.</p>
                    <p><strong className="text-foreground">8.2 Disponibilité.</strong> Wslni.ma s'engage à maintenir la plateforme opérationnelle avec un objectif de disponibilité de 99 % par mois. Des interruptions pour maintenance peuvent survenir et seront annoncées dans la mesure du possible.</p>
                    <p><strong className="text-foreground">8.3 Limitation de responsabilité.</strong> En aucun cas Wslni.ma ne saurait être tenu responsable des dommages indirects, consécutifs ou punitifs résultant de l'utilisation ou de l'impossibilité d'utiliser la plateforme.</p>
                  </div>
                </section>

                <section id="s9" className="scroll-mt-28">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-primary font-mono text-base">9.</span>
                    Suspension et résiliation
                  </h2>
                  <div className="space-y-3 text-muted-foreground leading-relaxed">
                    <p><strong className="text-foreground">9.1 Causes de suspension.</strong> Wslni.ma se réserve le droit de suspendre ou résilier tout compte en cas de violation des présentes CGU, de comportement frauduleux, de réclamations répétées ou de toute activité pouvant nuire à la plateforme ou à ses utilisateurs.</p>
                    <p><strong className="text-foreground">9.2 Procédure.</strong> En cas de violation grave, la suspension peut être immédiate. Pour les manquements moins graves, un avertissement est adressé avant toute mesure.</p>
                    <p><strong className="text-foreground">9.3 Conséquences.</strong> La résiliation entraîne la perte d'accès au compte et aux données associées. Les commandes en cours sont finalisées selon les procédures habituelles avant la clôture définitive.</p>
                  </div>
                </section>

                <section id="s10" className="scroll-mt-28">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-primary font-mono text-base">10.</span>
                    Modification des CGU
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Wslni.ma se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle par e-mail ou notification sur la plateforme au moins 30 jours avant l'entrée en vigueur des nouvelles conditions. La poursuite de l'utilisation de la plateforme après cette période vaut acceptation des nouvelles CGU.
                  </p>
                </section>

                <section id="s11" className="scroll-mt-28">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-primary font-mono text-base">11.</span>
                    Droit applicable et litiges
                  </h2>
                  <div className="space-y-3 text-muted-foreground leading-relaxed">
                    <p><strong className="text-foreground">11.1 Droit applicable.</strong> Les présentes CGU sont régies par le droit marocain, notamment le Code des obligations et contrats (DOC) et les textes législatifs relatifs au commerce électronique.</p>
                    <p><strong className="text-foreground">11.2 Résolution amiable.</strong> En cas de litige entre un utilisateur et Wslni.ma, les parties s'engagent à chercher une résolution amiable avant tout recours judiciaire.</p>
                    <p><strong className="text-foreground">11.3 Juridiction compétente.</strong> À défaut de résolution amiable, tout litige sera soumis à la compétence exclusive des tribunaux de commerce de Casablanca, Maroc.</p>
                  </div>
                </section>
              </div>

              <div className="mt-12 p-5 rounded-2xl bg-secondary/40 border border-border">
                <p className="text-sm text-muted-foreground">
                  Pour toute question relative aux présentes CGU, contacte-nous à <strong className="text-foreground">legal@wslni.ma</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
