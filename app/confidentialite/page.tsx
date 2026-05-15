"use client"

import { useEffect, useRef, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Shield, Calendar } from "lucide-react"

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
  { id: "p1", number: "1.", title: "Responsable du traitement" },
  { id: "p2", number: "2.", title: "Données collectées" },
  { id: "p3", number: "3.", title: "Finalités du traitement" },
  { id: "p4", number: "4.", title: "Base légale du traitement" },
  { id: "p5", number: "5.", title: "Conservation des données" },
  { id: "p6", number: "6.", title: "Partage des données" },
  { id: "p7", number: "7.", title: "Cookies et traceurs" },
  { id: "p8", number: "8.", title: "Tes droits" },
  { id: "p9", number: "9.", title: "Sécurité des données" },
  { id: "p10", number: "10.", title: "Transferts internationaux" },
  { id: "p11", number: "11.", title: "Modifications de la politique" },
  { id: "p12", number: "12.", title: "Nous contacter" },
]

export default function ConfidentialitePage() {
  const [active, setActive] = useState("p1")
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
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Documents légaux</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Politique de Confidentialité
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Dernière mise à jour : 1er janvier 2024
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>Version 1.0</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>Conforme à la loi 09-08</span>
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
                      onClick={(e) => {
                        e.preventDefault()
                        document.getElementById(sec.id)?.scrollIntoView({ behavior: "smooth", block: "start" })
                      }}
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
            <div className="lg:col-span-3 max-w-none">
              {/* Preamble */}
              <div className="p-6 rounded-2xl bg-secondary/40 border border-border mb-10">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  La présente politique de confidentialité décrit la manière dont{" "}
                  <strong className="text-foreground">Wslni SARL</strong>, opérateur de la plateforme Wslni.ma,
                  collecte, utilise et protège tes données personnelles. Elle est conforme à la loi marocaine n° 09-08
                  relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel.
                </p>
              </div>

              <div className="space-y-12">
                <section id="p1" className="scroll-mt-28">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-primary font-mono text-base">1.</span>
                    Responsable du traitement
                  </h2>
                  <div className="space-y-3 text-muted-foreground leading-relaxed">
                    <p>Le responsable du traitement de tes données personnelles est :</p>
                    <div className="ps-4 border-s-2 border-border space-y-1 text-sm">
                      <p><strong className="text-foreground">Wslni SARL</strong></p>
                      <p>Casablanca, Maroc</p>
                      <p>E-mail : privacy@wslni.ma</p>
                    </div>
                    <p>Pour toute question relative à la protection de tes données, tu peux contacter notre délégué à la protection des données (DPO) à l'adresse ci-dessus.</p>
                  </div>
                </section>

                <section id="p2" className="scroll-mt-28">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-primary font-mono text-base">2.</span>
                    Données collectées
                  </h2>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <div>
                      <p className="font-semibold text-foreground mb-2">2.1 Données fournies directement</p>
                      <ul className="list-none space-y-1 text-sm">
                        {[
                          "Données d'identification : nom, prénom, adresse e-mail, numéro de téléphone",
                          "Données de profil : photo, biographie, compétences, portfolio, tarifs",
                          "Données de vérification : copie de pièce d'identité (pour les freelances)",
                          "Données de paiement : coordonnées bancaires (traitées de façon sécurisée par nos partenaires de paiement)",
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-2">2.2 Données collectées automatiquement</p>
                      <ul className="list-none space-y-1 text-sm">
                        {[
                          "Données de navigation : adresse IP, type de navigateur, pages visitées, durée de session",
                          "Données de comportement : recherches effectuées, services consultés, commandes passées",
                          "Données techniques : identifiants de session, cookies de fonctionnement",
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-2">2.3 Données de transactions</p>
                      <ul className="list-none space-y-1 text-sm">
                        {[
                          "Historique des commandes, montants, dates, statuts",
                          "Évaluations et commentaires laissés ou reçus",
                          "Échanges de messages entre utilisateurs",
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="p3" className="scroll-mt-28">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-primary font-mono text-base">3.</span>
                    Finalités du traitement
                  </h2>
                  <div className="space-y-3 text-muted-foreground leading-relaxed">
                    <p>Tes données personnelles sont utilisées pour les finalités suivantes :</p>
                    <ul className="space-y-2 text-sm">
                      {[
                        "Création, gestion et sécurisation de ton compte utilisateur",
                        "Mise en relation entre clients et freelances",
                        "Traitement et sécurisation des paiements",
                        "Gestion des commandes, livraisons et litiges",
                        "Communication avec toi (notifications, e-mails transactionnels, support)",
                        "Lutte contre la fraude et la sécurisation de la plateforme",
                        "Amélioration de nos services et analyses statistiques (données agrégées et anonymisées)",
                        "Respect de nos obligations légales et réglementaires",
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section id="p4" className="scroll-mt-28">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-primary font-mono text-base">4.</span>
                    Base légale du traitement
                  </h2>
                  <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
                    <p>Le traitement de tes données repose sur les bases légales suivantes selon la loi 09-08 :</p>
                    <p><strong className="text-foreground">Exécution du contrat :</strong> traitement nécessaire à la fourniture des services de mise en relation, gestion des commandes et paiements.</p>
                    <p><strong className="text-foreground">Consentement :</strong> communications marketing et newsletters auxquelles tu t'es volontairement inscrit.</p>
                    <p><strong className="text-foreground">Intérêt légitime :</strong> prévention de la fraude, sécurité de la plateforme, amélioration des services.</p>
                    <p><strong className="text-foreground">Obligation légale :</strong> respect des obligations fiscales, comptables et réglementaires applicables au Maroc.</p>
                  </div>
                </section>

                <section id="p5" className="scroll-mt-28">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-primary font-mono text-base">5.</span>
                    Conservation des données
                  </h2>
                  <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
                    <p>Les données sont conservées pendant les durées suivantes :</p>
                    <div className="rounded-xl border border-border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-secondary/50">
                          <tr>
                            <th className="text-start p-3 font-semibold text-foreground">Type de donnée</th>
                            <th className="text-start p-3 font-semibold text-foreground">Durée de conservation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {[
                            ["Données de compte actif", "Durée du compte + 3 ans"],
                            ["Données de transactions", "10 ans (obligations comptables)"],
                            ["Données de vérification d'identité", "5 ans après clôture du compte"],
                            ["Logs de connexion", "12 mois"],
                            ["Données de navigation (cookies)", "13 mois maximum"],
                          ].map(([type, duree]) => (
                            <tr key={type} className="hover:bg-secondary/20">
                              <td className="p-3 text-muted-foreground">{type}</td>
                              <td className="p-3 text-foreground font-medium">{duree}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                <section id="p6" className="scroll-mt-28">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-primary font-mono text-base">6.</span>
                    Partage des données
                  </h2>
                  <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
                    <p>Tes données personnelles ne sont jamais vendues à des tiers. Elles peuvent être partagées avec :</p>
                    <p><strong className="text-foreground">Autres utilisateurs :</strong> les informations de ton profil public (nom, photo, biographie, compétences, évaluations) sont visibles par les autres membres de la plateforme.</p>
                    <p><strong className="text-foreground">Prestataires de services :</strong> nos partenaires techniques (hébergement, paiement, e-mail, analytiques) accèdent à tes données dans la stricte mesure nécessaire à l'exécution de leurs prestations et sont liés par des contrats de confidentialité.</p>
                    <p><strong className="text-foreground">Autorités compétentes :</strong> en cas d'obligation légale ou de réquisition judiciaire dûment motivée.</p>
                  </div>
                </section>

                <section id="p7" className="scroll-mt-28">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-primary font-mono text-base">7.</span>
                    Cookies et traceurs
                  </h2>
                  <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
                    <p>Wslni.ma utilise des cookies et traceurs pour :</p>
                    <p><strong className="text-foreground">Cookies essentiels :</strong> indispensables au fonctionnement de la plateforme (gestion de session, authentification). Ces cookies ne peuvent pas être refusés.</p>
                    <p><strong className="text-foreground">Cookies analytiques :</strong> pour comprendre comment les utilisateurs naviguent sur la plateforme et améliorer l'expérience. Ces cookies nécessitent ton consentement.</p>
                    <p><strong className="text-foreground">Cookies de préférence :</strong> pour mémoriser tes choix (langue, thème) d'une session à l'autre.</p>
                    <p>Tu peux gérer tes préférences de cookies depuis les paramètres de ton navigateur ou via le panneau de gestion des cookies disponible sur la plateforme.</p>
                  </div>
                </section>

                <section id="p8" className="scroll-mt-28">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-primary font-mono text-base">8.</span>
                    Tes droits
                  </h2>
                  <div className="space-y-4 text-muted-foreground leading-relaxed text-sm">
                    <p>Conformément à la loi 09-08, tu disposes des droits suivants :</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        { droit: "Droit d'accès", desc: "Obtenir une copie de tes données personnelles traitées par Wslni.ma." },
                        { droit: "Droit de rectification", desc: "Faire corriger toute donnée inexacte ou incomplète." },
                        { droit: "Droit à l'effacement", desc: "Demander la suppression de tes données sous conditions." },
                        { droit: "Droit d'opposition", desc: "T'opposer au traitement de tes données à des fins de marketing." },
                        { droit: "Droit à la portabilité", desc: "Recevoir tes données dans un format structuré et lisible." },
                        { droit: "Droit de limitation", desc: "Demander la suspension du traitement dans certains cas." },
                      ].map((item) => (
                        <div key={item.droit} className="p-4 rounded-xl border border-border bg-card">
                          <p className="font-semibold text-foreground mb-1">{item.droit}</p>
                          <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                    <p>Pour exercer ces droits, contacte-nous à <strong className="text-foreground">privacy@wslni.ma</strong>. Nous répondons dans un délai d'un mois.</p>
                  </div>
                </section>

                <section id="p9" className="scroll-mt-28">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-primary font-mono text-base">9.</span>
                    Sécurité des données
                  </h2>
                  <div className="space-y-3 text-muted-foreground leading-relaxed">
                    <p>Wslni.ma met en œuvre des mesures techniques et organisationnelles appropriées pour protéger tes données :</p>
                    <ul className="space-y-1.5 text-sm">
                      {[
                        "Chiffrement des données en transit (TLS 1.3) et au repos (AES-256)",
                        "Authentification forte pour l'accès aux systèmes internes",
                        "Audits de sécurité réguliers et tests de pénétration",
                        "Accès aux données limité au personnel habilité selon le principe du moindre privilège",
                        "Sauvegardes chiffrées quotidiennes avec plan de reprise d'activité",
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section id="p10" className="scroll-mt-28">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-primary font-mono text-base">10.</span>
                    Transferts internationaux
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Certains de nos prestataires de services (hébergement cloud, paiement, e-mail transactionnel) peuvent être établis en dehors du Maroc. Dans ce cas, nous nous assurons que les transferts de données sont encadrés par des garanties adéquates (clauses contractuelles types, certifications reconnues) conformément aux exigences de la loi 09-08 et des recommandations de la CNDP.
                  </p>
                </section>

                <section id="p11" className="scroll-mt-28">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-primary font-mono text-base">11.</span>
                    Modifications de la politique
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Nous pouvons mettre à jour cette politique de confidentialité pour refléter l'évolution de nos pratiques ou des obligations légales. En cas de modification substantielle, tu seras informé par e-mail ou par une notification sur la plateforme au moins 30 jours avant l'entrée en vigueur des changements.
                  </p>
                </section>

                <section id="p12" className="scroll-mt-28">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-primary font-mono text-base">12.</span>
                    Nous contacter
                  </h2>
                  <div className="space-y-3 text-muted-foreground leading-relaxed">
                    <p>Pour toute question, réclamation ou exercice de tes droits relatifs à tes données personnelles :</p>
                    <div className="ps-4 border-s-2 border-primary/30 space-y-1 text-sm">
                      <p><strong className="text-foreground">E-mail DPO :</strong> privacy@wslni.ma</p>
                      <p><strong className="text-foreground">Support général :</strong> support@wslni.ma</p>
                      <p><strong className="text-foreground">Adresse postale :</strong> Wslni SARL, Casablanca, Maroc</p>
                    </div>
                    <p className="text-sm">
                      Tu as également le droit d'introduire une réclamation auprès de la Commission Nationale de contrôle de la protection des Données à caractère Personnel (CNDP) si tu estimes que le traitement de tes données n'est pas conforme à la loi.
                    </p>
                  </div>
                </section>
              </div>

              <div className="mt-12 p-5 rounded-2xl bg-secondary/40 border border-border">
                <p className="text-sm text-muted-foreground">
                  Cette politique de confidentialité est rédigée en français. En cas de traduction, la version française fait foi.
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
