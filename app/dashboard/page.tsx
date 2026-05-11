"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Loader2, Plus, Edit2, Briefcase, CheckCircle2, Clock,
  ArrowRight, User, Star, TrendingUp,
} from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { getCategoryLabel, CATEGORY_COLORS } from "@/lib/categories"

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

interface Service {
  id: string
  title: string
  description: string
  category: string
  price: number
  delivery_days: number
  status: string
  created_at: string
}

function computeCompletion(profile: Profile | null): { pct: number; missing: string[] } {
  if (!profile) return { pct: 0, missing: [] }
  const checks: Array<{ label: string; weight: number; ok: boolean }> = [
    { label: "Nom complet",      weight: 20, ok: !!profile.full_name },
    { label: "Titre professionnel", weight: 20, ok: !!profile.job_title },
    { label: "Biographie",       weight: 20, ok: !!profile.bio },
    { label: "Compétences",      weight: 15, ok: (profile.skills ?? []).length > 0 },
    { label: "Photo de profil",  weight: 15, ok: !!profile.avatar_url },
    { label: "Tarif horaire",    weight: 10, ok: profile.hourly_rate != null },
  ]
  const pct = checks.filter((c) => c.ok).reduce((acc, c) => acc + c.weight, 0)
  const missing = checks.filter((c) => !c.ok).map((c) => c.label)
  return { pct, missing }
}

function initials(name: string | null, email?: string | null) {
  const src = name || email?.split("@")[0] || "?"
  return src.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

function memberSince(ts?: string | null) {
  if (!ts) return null
  return new Date(ts).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
}

function ZelligeCover() {
  return (
    <div className="h-44 relative overflow-hidden bg-primary">
      <svg className="absolute inset-0 w-full h-full" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="zellige-dash" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
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
        <rect width="100%" height="100%" fill="url(#zellige-dash)" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/15" />
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace("/connexion"); return }
      setUser(user)

      const [{ data: profileData }, { data: servicesData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("services")
          .select("id, title, description, category, price, delivery_days, status, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ])

      setProfile(profileData ?? {
        id: user.id,
        full_name: (user.user_metadata?.full_name as string) ?? null,
        job_title: null, bio: null, skills: [], hourly_rate: null, portfolio_links: [], avatar_url: null,
      })
      setServices((servicesData as Service[]) ?? [])
      setLoading(false)
    })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user || !profile) return null

  const displayName = profile.full_name || user.email?.split("@")[0] || "Freelance"
  const ini = initials(profile.full_name, user.email)
  const { pct, missing } = computeCompletion(profile)
  const publishedServices = services.filter((s) => s.status === "published")
  const since = memberSince(profile.updated_at)

  const pctColor =
    pct >= 80 ? "bg-emerald-500" :
    pct >= 50 ? "bg-amber-500" :
    "bg-primary"

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background">
        {/* Cover */}
        <div className="relative">
          <ZelligeCover />
          <div className="absolute inset-0 flex items-end pb-5 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl w-full mx-auto">
              <p className="text-white/70 text-sm font-medium tracking-wide uppercase mb-0.5">
                Tableau de bord
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow">
                Bonjour, {displayName.split(" ")[0]} 👋
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Avatar + quick actions row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 pb-6 border-b border-border mb-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-primary overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-white select-none">{ini}</span>
                )}
              </div>
              <div>
                <p className="font-bold text-foreground text-lg leading-tight">{displayName}</p>
                {profile.job_title && (
                  <p className="text-sm text-muted-foreground">{profile.job_title}</p>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline" className="gap-1.5 font-medium">
                <Link href="/profil">
                  <Edit2 className="h-3.5 w-3.5" />
                  Modifier le profil
                </Link>
              </Button>
              <Button asChild size="sm" className="gap-1.5 font-medium bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/services/nouveau">
                  <Plus className="h-3.5 w-3.5" />
                  Nouveau service
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground leading-none">{publishedServices.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Services publiés</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground leading-none">
                  {(profile.skills ?? []).length}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Compétences</p>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-2xl border border-border bg-card p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground leading-none">{pct}%</p>
                <p className="text-xs text-muted-foreground mt-0.5">Profil complété</p>
              </div>
            </div>
          </div>

          {/* Profile completion card */}
          {pct < 100 && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm mb-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h2 className="font-bold text-foreground text-sm">Complétez votre profil</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Un profil complet augmente vos chances d'être contacté.
                  </p>
                </div>
                <span className="text-xl font-black text-foreground shrink-0">{pct}%</span>
              </div>

              {/* Progress bar */}
              <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${pctColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Missing fields */}
              {missing.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Informations manquantes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {missing.map((label) => (
                      <span
                        key={label}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-foreground"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Button asChild size="sm" variant="outline" className="mt-4 gap-1.5 font-medium text-xs">
                <Link href="/profil">
                  <User className="h-3.5 w-3.5" />
                  Compléter mon profil
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          )}

          {pct === 100 && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm mb-6 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">Profil complété à 100%</p>
                <p className="text-xs text-emerald-700">Votre profil est optimisé pour attirer des clients.</p>
              </div>
            </div>
          )}

          {/* Services section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-foreground">Mes services</h2>
              <Button asChild size="sm" variant="ghost" className="gap-1.5 text-primary hover:text-primary font-medium text-xs">
                <Link href="/services/nouveau">
                  <Plus className="h-3.5 w-3.5" />
                  Ajouter
                </Link>
              </Button>
            </div>

            {publishedServices.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-7 w-7 text-primary" />
                </div>
                <p className="font-bold text-foreground mb-1">Aucun service publié</p>
                <p className="text-sm text-muted-foreground mb-5">
                  Créez votre premier service et commencez à recevoir des clients.
                </p>
                <Button asChild className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  <Link href="/services/nouveau">
                    <Plus className="h-4 w-4" />
                    Créer un service
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {publishedServices.map((service) => (
                  <div
                    key={service.id}
                    className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          CATEGORY_COLORS[service.category] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {getCategoryLabel(service.category)}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold shrink-0">
                        <CheckCircle2 className="h-3 w-3" />
                        Publié
                      </span>
                    </div>

                    <h3 className="font-bold text-foreground text-sm leading-snug line-clamp-2">
                      {service.title}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                      {service.description}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-foreground text-base">
                          {service.price.toLocaleString("fr-MA")}{" "}
                          <span className="text-xs font-semibold text-muted-foreground">MAD</span>
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {service.delivery_days}j
                        </span>
                      </div>
                      <Button asChild size="sm" variant="ghost" className="h-7 px-2.5 text-xs gap-1 font-medium">
                        <Link href={`/services/${service.id}/modifier`}>
                          <Edit2 className="h-3 w-3" />
                          Modifier
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* All services link when there are services */}
            {publishedServices.length > 0 && (
              <div className="mt-4 text-center">
                <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground text-xs font-medium">
                  <Link href="/services">
                    Voir tous les services
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Member since footer */}
          {since && (
            <p className="text-center text-xs text-muted-foreground mt-10">
              Membre depuis {since}
            </p>
          )}
        </div>
      </main>
    </>
  )
}
