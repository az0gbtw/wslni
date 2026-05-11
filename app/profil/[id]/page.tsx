"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { ExternalLink, Edit2, MessageCircle, Loader2, ArrowLeft } from "lucide-react"
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
}

function initials(name: string | null) {
  if (!name) return "?"
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
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
        {/* Cover */}
        <div className="h-36 bg-gradient-to-br from-primary to-primary/60" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 pb-6 border-b border-border">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-background bg-primary flex items-center justify-center overflow-hidden shadow-md shrink-0">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl sm:text-3xl font-bold text-primary-foreground">{ini}</span>
                )}
              </div>
              <div className="mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">{displayName}</h1>
                {profile.job_title && (
                  <p className="text-muted-foreground text-sm mt-0.5">{profile.job_title}</p>
                )}
                {profile.hourly_rate != null && (
                  <p className="text-primary font-semibold text-sm mt-1">
                    {profile.hourly_rate.toLocaleString("fr-MA")} MAD/h
                  </p>
                )}
              </div>
            </div>

            <div className="self-start sm:self-auto">
              {isOwner ? (
                <Button asChild variant="outline" className="shrink-0">
                  <Link href="/profil">
                    <Edit2 className="h-4 w-4" />
                    Modifier mon profil
                  </Link>
                </Button>
              ) : (
                <Button
                  className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => setContactOpen(true)}
                >
                  <MessageCircle className="h-4 w-4" />
                  Contacter
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Main */}
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
                        className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
                      >
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

              {!profile.bio && profile.skills.length === 0 && portfolioLinks.length === 0 && (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Ce freelance n&apos;a pas encore complété son profil.
                </p>
              )}
            </div>

            {/* Sidebar */}
            <div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
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
                    Contacter {profile.full_name?.split(" ")[0] ?? "ce freelance"}
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
