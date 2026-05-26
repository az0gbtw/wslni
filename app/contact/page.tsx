"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Mail,
  Clock,
  CheckCircle,
  Send,
  MessageSquare,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  MapPin,
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

const subjects = [
  "Choisir un sujet...",
  "Question générale",
  "Problème technique",
  "Signalement d'un utilisateur",
  "Question sur un paiement",
  "Partenariat",
  "Presse & Médias",
  "Autre",
]

const contactCards = [
  {
    icon: Mail,
    label: "E-mail support",
    value: "support@wslni.ma",
    detail: "Pour toute question générale",
  },
  {
    icon: Clock,
    label: "Délai de réponse",
    value: "Moins de 24h",
    detail: "Du lundi au vendredi, 9h–18h",
  },
]

const socials = [
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Twitter, label: "Twitter / X", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
]

interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!formData.name.trim()) errs.name = "Le nom est requis."
    if (!formData.email.trim()) {
      errs.email = "L'e-mail est requis."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = "Adresse e-mail invalide."
    }
    if (!formData.subject || formData.subject === subjects[0]) errs.subject = "Choisis un sujet."
    if (!formData.message.trim()) {
      errs.message = "Le message est requis."
    } else if (formData.message.trim().length < 20) {
      errs.message = "Le message doit contenir au moins 20 caractères."
    }
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setLoading(true)
    // Simulate network request
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setSuccess(true)
  }

  function handleChange(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

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
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Nous contacter</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
            Une question&nbsp;? On est{" "}
            <span className="text-primary">là pour toi</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Notre équipe répond à toutes les demandes en moins de 24 heures ouvrables.
          </p>
        </div>
      </section>

      <ZelligeDivider />

      <section className="py-16 bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Form — left (3 cols) */}
            <div className="lg:col-span-3">
              {success ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8 rounded-2xl bg-secondary/40 border border-border">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center mb-5">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-3">Message envoyé !</h2>
                  <p className="text-muted-foreground max-w-sm mb-7">
                    Merci de nous avoir contactés. Notre équipe te répondra à <strong>{formData.email}</strong> dans les 24 heures ouvrables.
                  </p>
                  <Button
                    onClick={() => { setSuccess(false); setFormData({ name: "", email: "", subject: "", message: "" }) }}
                    variant="outline"
                    className="border-2 hover:border-primary hover:text-primary transition-all"
                  >
                    Envoyer un autre message
                  </Button>
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-foreground mb-6">Envoyer un message</h2>
                  <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Nom complet <span className="text-primary">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          placeholder="Votre nom"
                          className={`h-11 rounded-xl ${errors.name ? "border-destructive focus:border-destructive" : ""}`}
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Adresse e-mail <span className="text-primary">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          placeholder="votre@email.com"
                          className={`h-11 rounded-xl ${errors.email ? "border-destructive focus:border-destructive" : ""}`}
                        />
                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="subject" className="text-sm font-medium">
                        Sujet <span className="text-primary">*</span>
                      </Label>
                      <select
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleChange("subject", e.target.value)}
                        className={`w-full h-11 rounded-xl border px-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors ${
                          errors.subject ? "border-destructive" : "border-input"
                        }`}
                      >
                        {subjects.map((s) => (
                          <option key={s} value={s} disabled={s === subjects[0]}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="message" className="text-sm font-medium">
                        Message <span className="text-primary">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        placeholder="Décris ta demande en détail..."
                        rows={6}
                        className={`rounded-xl resize-none ${errors.message ? "border-destructive focus:border-destructive" : ""}`}
                      />
                      <div className="flex items-center justify-between">
                        {errors.message ? (
                          <p className="text-xs text-destructive">{errors.message}</p>
                        ) : (
                          <span />
                        )}
                        <span className="text-xs text-muted-foreground">{formData.message.length} / 1000</span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={loading}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-70"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Envoi en cours...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          Envoyer le message
                        </span>
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </div>

            {/* Info — right (2 cols) */}
            <div className="lg:col-span-2 space-y-5">
              {contactCards.map((card, i) => {
                const Icon = card.icon
                return (
                  <div key={i} className="flex gap-4 p-5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{card.label}</p>
                      <p className="font-semibold text-foreground">{card.value}</p>
                      <p className="text-sm text-muted-foreground">{card.detail}</p>
                    </div>
                  </div>
                )
              })}

              {/* Social links */}
              <div className="p-5 rounded-2xl bg-card border border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Réseaux sociaux</p>
                <div className="space-y-3">
                  {socials.map((s, i) => {
                    const Icon = s.icon
                    return (
                      <a
                        key={i}
                        href={s.href}
                        className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        {s.label}
                      </a>
                    )
                  })}
                </div>
              </div>

              {/* Note */}
              <div className="p-5 rounded-2xl bg-primary/5 border border-primary/15">
                <p className="text-sm text-foreground leading-relaxed">
                  <strong>Freelances et clients avec un compte Wslni.ma</strong> — pour toute question liée à une commande spécifique, passe par la messagerie intégrée à ta commande pour un traitement prioritaire.
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
