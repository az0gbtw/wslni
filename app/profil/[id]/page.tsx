"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import {
  ExternalLink, Edit2, MessageCircle, Loader2, ArrowLeft,
  Tag, Calendar, MessageSquare, CheckCircle2, Briefcase, Plus,
} from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface Profile {
  id: string
  full_name: string | null
  job_title: string | null
  bio: string | null
  skills: string[]
  hourly_rate: number | null
  portfolio_links: string[]
  avatar_url: string | null
  updated_at?: string | null
}

function initials(name: string | null) {
  if (!name) return "?"
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

function memberSince(ts?: string | null) {
  if (!ts) return "—"
  return new Date(ts).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
}

function ZelligeCover() {
  return (
    <div className="h-52 relative overflow-hidden bg-primary">
      <svg
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="zellige-pub" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M24 2 L46 24 L24 46 L2 24 Z" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
            <path d="M24 12 L36 24 L24 36 L12 24 Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.13)" strokeWidth="1" />
            <line x1="24" y1="2" x2="24" y2="12" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
            <line x1="46" y1="24" x2="36" y2="24" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
            <line x1="24" y1="46" x2="24" y2="36" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
            <line x1="2" y1="24" x2="12" y2="24" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
            <circle cx="24" cy="24" r="2.5" fill="rgba(255,255,255,0.18)" />
            <circle cx="0" cy="0" r="2" fill="rgba(255,255,255,0.14)" />
            <circle cx="48" cy="0" r="2" fill="rgba(255,255,255,0.14)" />
            <circle cx="0" cy="48" r="2" fill="rgba(255,255,255,0.14)" />
            <circle cx="48" cy="48" r="2" fill="rgba(255,255,255,0.14)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#zellige-pub)" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/15" />
    </div>
  )
}

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined)
  const [viewer, setViewer] = useState<User | null>(null)
  const [contactOpen, setContactOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from("profiles").select("*").eq("id", id).single(),
      supabase.auth.getUser(),
    ]).then(([{ data }, { data: { user } }]) => {
      setProfile(data ?? null)
      setViewer(user)
    })
  }, [id])

  if (profile === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (profile === null) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-16 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Profil introuvable</h1>
            <p className="text-muted-foreground mb-6 text-sm">
              Ce profil n&apos;existe pas ou a été supprimé.
            </p>
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Retour à l&apos;accueil
              </Link>
            </Button>
          </div>
        </main>
      </>
    )
  }

  const isOwner = viewer?.id === id
  const displayName = profile.full_name || "Freelance"
  const ini = initials(profile.full_name)
  const portfolioLinks = profile.portfolio_links.filter(Boolean)

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background">
        <div className="relative">
          <ZelligeCover />
          <div className="absolute top-4 right-4 sm:right-8 z-10">
            {isOwner ? (
              <Button asChild variant="outline" size="sm" className="bg-white/90 hover:bg-white text-gray-800 border-white/40 shadow-md backdrop-blur-sm font-medium">
                <Link href="/profil">
                  <Edit2 className="h-3.5 w-3.5" />
                  Modifier mon profil
                </Link>
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md font-medium"
                onClick={() => setContactOpen(true)}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Contacter
              </Button>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header: avatar + name */}
          <div className="relative z-10 -mt-16 pb-6 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
              {/* Avatar overlaps the banner. On desktop it sits at the top of the row
                  which starts at -mt-16, so the top 64px is inside the banner. */}
              <div className="w-32 h-32 rounded-full bg-white shadow-xl shrink-0 p-1.5">
                <div className="w-full h-full rounded-full bg-primary overflow-hidden flex items-center justify-center">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-white leading-none select-none">{ini}</span>
                  )}
                </div>
              </div>
              {/* sm:pt-16 = 64px, exactly the amount the row is pulled into the banner,
                  so this column's content always starts at the banner's bottom edge. */}
              <div className="sm:pt-16 min-w-0 flex-1 pb-2">
                <h1 className="text-3xl sm:text-4xl font-black text-foreground leading-tight">
                  {displayName}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {profile.job_title && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                      {profile.job_title}
                    </span>
                  )}
                  {profile.hourly_rate != null && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-foreground text-xs font-semibold border border-border">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                      {profile.hourly_rate.toLocaleString("fr-MA")} MAD/h
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="py-5 border-b border-border grid grid-cols-3 divide-x divide-border">
            <div className="text-center px-4">
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs uppercase tracking-wide font-medium">Membre depuis</span>
              </div>
              <p className="text-sm font-semibold text-foreground capitalize">
                {memberSince(profile.updated_at)}
              </p>
            </div>
            <div className="text-center px-4">
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1.5">
                <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs uppercase tracking-wide font-medium">Taux de réponse</span>
              </div>
              <p className="text-sm font-semibold text-foreground">—</p>
            </div>
            <div className="text-center px-4">
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs uppercase tracking-wide font-medium">Missions réalisées</span>
              </div>
              <p className="text-sm font-semibold text-foreground">—</p>
            </div>
          </div>

          {/* Body */}
          <div className="py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* Main column */}
            <div className="lg:col-span-2 space-y-8">

              {profile.bio && (
                <section>
                  <h2 className="text-base font-semibold mb-3 text-foreground">À propos</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm">
                    {profile.bio}
                  </p>
                </section>
              )}

              {profile.skills.length > 0 && (
                <section>
                  <h2 className="text-base font-semibold mb-3 text-foreground">Compétences</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 hover:bg-primary/15 transition-colors"
                      >
                        <Tag className="h-3 w-3 shrink-0" />
                        {s}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {portfolioLinks.length > 0 && (
                <section>
                  <h2 className="text-base font-semibold mb-3 text-foreground">Portfolio</h2>
                  <div className="space-y-2">
                    {portfolioLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-muted transition-colors group"
                      >
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                        <span className="text-sm text-foreground truncate">{link}</span>
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {/* Services proposés — always shown */}
              <section>
                <h2 className="text-base font-semibold mb-3 text-foreground">Services proposés</h2>
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">Aucun service publié</p>
                  <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">
                    {isOwner
                      ? "Ajoutez vos premiers services pour attirer des clients et décrocher vos premières missions."
                      : "Ce freelance n'a pas encore publié de services. Revenez bientôt !"}
                  </p>
                  {isOwner && (
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Plus className="h-3.5 w-3.5" />
                      Ajouter un service
                    </Button>
                  )}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 sticky top-24">
                {profile.hourly_rate != null && (
                  <div className="pb-4 border-b border-border">
                    <p className="text-xs text-muted-foreground mb-1">Tarif horaire</p>
                    <p className="text-2xl font-bold text-foreground">
                      {profile.hourly_rate.toLocaleString("fr-MA")}
                      <span className="text-sm font-normal text-muted-foreground ml-1">MAD/h</span>
                    </p>
                  </div>
                )}

                {isOwner ? (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/profil">
                      <Edit2 className="h-4 w-4" />
                      Modifier mon profil
                    </Link>
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => setContactOpen(true)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Contacter {displayName}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Contact dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contacter {displayName}</DialogTitle>
            <DialogDescription>
              La messagerie intégrée arrive bientôt sur Wslni.ma.
            </DialogDescription>
          </DialogHeader>

          {portfolioLinks.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                En attendant, retrouvez ce freelance sur :
              </p>
              {portfolioLinks.map((link, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:bg-muted transition-colors group"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                  <span className="text-sm truncate">{link}</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Ce freelance n&apos;a pas encore renseigné ses liens. Revenez bientôt pour
              utiliser notre messagerie directement.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
