"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import {
  ExternalLink, Edit2, MessageCircle, Loader2, ArrowLeft,
  Tag, Calendar, CheckCircle2, Briefcase, Plus, Star, Clock,
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
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { formatPrice } from "@/lib/utils"

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

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  client_id: string
  client: { full_name: string | null; avatar_url: string | null } | null
}

interface Service {
  id: string
  title: string
  description: string
  price: number
  delivery_days: number
  category: string
  images: string[] | null
}

function initials(name: string | null) {
  if (!name) return "?"
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5"
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${cls} ${
            n <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-muted-foreground/10 text-muted-foreground/25"
          }`}
        />
      ))}
    </div>
  )
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
  const { lang } = useLanguage()
  const t = translations[lang].publicProfil

  const [profile, setProfile] = useState<Profile | null | undefined>(undefined)
  const [viewer, setViewer] = useState<User | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [contactOpen, setContactOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from("profiles").select("*").eq("id", id).single(),
      supabase.auth.getUser(),
      supabase
        .from("reviews")
        .select("id, rating, comment, created_at, client_id")
        .eq("freelancer_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("services")
        .select("id, title, description, price, delivery_days, category, images")
        .eq("user_id", id)
        .eq("status", "published")
        .order("created_at", { ascending: false }),
    ]).then(async ([{ data: profileData }, { data: { user } }, { data: reviewsData }, { data: servicesData }]) => {
      setProfile(profileData ?? null)
      setViewer(user)
      setServices(servicesData ?? [])

      if (reviewsData && reviewsData.length > 0) {
        const clientIds = [...new Set(reviewsData.map((r: { client_id: string }) => r.client_id))]
        const { data: clientsData } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", clientIds)
        const clientsMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {}
        clientsData?.forEach((c: { id: string; full_name: string | null; avatar_url: string | null }) => {
          clientsMap[c.id] = { full_name: c.full_name, avatar_url: c.avatar_url }
        })
        setReviews(
          reviewsData.map((r: { id: string; rating: number; comment: string | null; created_at: string; client_id: string }) => ({
            ...r,
            client: clientsMap[r.client_id] ?? null,
          }))
        )
      }
    })
  }, [id])

  const dateLocale = lang === "ar" ? "ar-MA-u-nu-arab" : "fr-FR"

  function memberSince(ts?: string | null) {
    if (!ts) return "—"
    return new Date(ts).toLocaleDateString(dateLocale, { month: "long", year: "numeric" })
  }

  function formatDate(ts: string) {
    return new Date(ts).toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" })
  }

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
            <h1 className="text-2xl font-bold mb-2">{t.notFound}</h1>
            <p className="text-muted-foreground mb-6 text-sm">{t.notFoundSub}</p>
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className={`h-4 w-4 ${lang === "ar" ? "rotate-180" : ""}`} />
                {t.backHome}
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

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background">
        <div className="relative">
          <ZelligeCover />
          <div className="absolute top-20 end-4 sm:end-8 z-10">
            {isOwner ? (
              <Button asChild variant="outline" size="sm" className="bg-white/90 hover:bg-white text-gray-800 border-white/40 shadow-md backdrop-blur-sm font-medium">
                <Link href="/profil">
                  <Edit2 className="h-3.5 w-3.5" />
                  {t.editProfile}
                </Link>
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md font-medium"
                onClick={() => setContactOpen(true)}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                {t.contact}
              </Button>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header: avatar + name */}
          <div className="relative z-10 -mt-16 pb-6 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
              <div className="w-32 h-32 rounded-full bg-white shadow-xl shrink-0 p-1.5">
                <div className="w-full h-full rounded-full bg-primary overflow-hidden flex items-center justify-center">
                  {profile.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-white leading-none select-none">{ini}</span>
                  )}
                </div>
              </div>
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
                      {formatPrice(profile.hourly_rate, lang)} MAD/h
                    </span>
                  )}
                  {avgRating !== null && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {avgRating.toFixed(1)} ({t.reviewsCount(reviews.length)})
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
                <span className="text-xs uppercase tracking-wide font-medium">{t.memberSince}</span>
              </div>
              <p className="text-sm font-semibold text-foreground capitalize">
                {memberSince(profile.updated_at)}
              </p>
            </div>
            <div className="text-center px-4">
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1.5">
                <Star className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs uppercase tracking-wide font-medium">{t.avgRating}</span>
              </div>
              {avgRating !== null ? (
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-sm font-semibold text-foreground">{avgRating.toFixed(1)}</span>
                  <StarDisplay rating={Math.round(avgRating)} />
                </div>
              ) : (
                <p className="text-sm font-semibold text-foreground">—</p>
              )}
            </div>
            <div className="text-center px-4">
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs uppercase tracking-wide font-medium">{t.missions}</span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {reviews.length > 0 ? reviews.length : "—"}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* Main column */}
            <div className="lg:col-span-2 space-y-8">

              {profile.bio && (
                <section>
                  <h2 className="text-base font-semibold mb-3 text-foreground">{t.about}</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm">
                    {profile.bio}
                  </p>
                </section>
              )}

              {profile.skills.length > 0 && (
                <section>
                  <h2 className="text-base font-semibold mb-3 text-foreground">{t.skills}</h2>
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
                  <h2 className="text-base font-semibold mb-3 text-foreground">{t.portfolio}</h2>
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

              {/* Client reviews */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {t.reviews}
                    {reviews.length > 0 && (
                      <span className="text-xs font-normal text-muted-foreground">
                        ({reviews.length})
                      </span>
                    )}
                  </h2>
                  {avgRating !== null && (
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-black text-foreground">{avgRating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">/ 5</span>
                    </div>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
                    <div className="flex justify-center mb-3">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className="h-6 w-6 fill-muted-foreground/10 text-muted-foreground/25" />
                      ))}
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">{t.noReviewsTitle}</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      {isOwner ? t.noReviewsOwner : t.noReviewsVisitor}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((review) => {
                      const clientName = review.client?.full_name || "Client"
                      const clientIni = initials(review.client?.full_name ?? null)
                      return (
                        <div key={review.id} className="rounded-xl border border-border bg-card p-4">
                          <div className="flex items-start gap-3">
                            <div className="shrink-0">
                              {review.client?.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={review.client.avatar_url}
                                  alt={clientName}
                                  className="h-9 w-9 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-[10px] font-bold text-primary">{clientIni}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                                <p className="text-sm font-semibold text-foreground">{clientName}</p>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {formatDate(review.created_at)}
                                </span>
                              </div>
                              <StarDisplay rating={review.rating} />
                              {review.comment && (
                                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                  {review.comment}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>

              {/* Proposed services */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-foreground">{t.proposedServices}</h2>
                  {isOwner && (
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/dashboard/new-service">
                        <Plus className="h-3.5 w-3.5" />
                        {t.addService}
                      </Link>
                    </Button>
                  )}
                </div>

                {services.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">{t.noServicesTitle}</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      {isOwner ? t.noServicesOwner : t.noServicesVisitor}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {services.map((svc) => (
                      <Link
                        key={svc.id}
                        href={`/services/${svc.id}`}
                        className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-md transition-all duration-200"
                      >
                        {/* Service image or placeholder */}
                        <div className="aspect-video bg-muted overflow-hidden">
                          {svc.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={svc.images[0]}
                              alt={svc.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Briefcase className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <div className="p-3.5">
                          <p className="text-sm font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                            {svc.title}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 shrink-0" />
                              <span>{svc.delivery_days}j</span>
                            </div>
                            <p className="text-sm font-bold text-foreground">
                              {formatPrice(svc.price, lang)}
                              <span className="text-xs font-normal text-muted-foreground ms-1">MAD</span>
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 sticky top-24">
                {profile.hourly_rate != null && (
                  <div className="pb-4 border-b border-border">
                    <p className="text-xs text-muted-foreground mb-1">{t.hourlyRate}</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatPrice(profile.hourly_rate, lang)}
                      <span className="text-sm font-normal text-muted-foreground ms-1">MAD/h</span>
                    </p>
                  </div>
                )}

                {avgRating !== null && (
                  <div className="pb-4 border-b border-border">
                    <p className="text-xs text-muted-foreground mb-2">{t.clientRating}</p>
                    <StarDisplay rating={Math.round(avgRating)} size="lg" />
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {avgRating.toFixed(1)}/5 · {t.reviewsCount(reviews.length)}
                    </p>
                  </div>
                )}

                {isOwner ? (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/profil">
                      <Edit2 className="h-4 w-4" />
                      {t.editProfile}
                    </Link>
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => setContactOpen(true)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    {t.contact} {displayName}
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
            <DialogTitle>{t.contactTitle(displayName)}</DialogTitle>
            <DialogDescription>{t.contactDesc}</DialogDescription>
          </DialogHeader>

          {portfolioLinks.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{t.contactPortfolioPrompt}</p>
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
            <p className="text-sm text-muted-foreground">{t.contactNoLinks}</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
