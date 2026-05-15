"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Loader2, Plus, Edit2, Briefcase, CheckCircle2, Clock,
  ArrowRight, User, Star, TrendingUp, ShoppingBag, Package,
} from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { getCategoryLabel, CATEGORY_COLORS } from "@/lib/categories"
import { formatPrice, formatDate as fmtDate } from "@/lib/utils"

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

interface Order {
  id: string
  service_id: string
  service_title: string
  price: number
  status: string
  client_id: string
  freelancer_id: string
  created_at: string
}

type ProfileSnap = { full_name: string | null; avatar_url: string | null }

type ProfileFieldKey = "fullName" | "jobTitle" | "bio" | "skills" | "avatar" | "hourlyRate"

function computeCompletion(profile: Profile | null): { pct: number; missing: ProfileFieldKey[] } {
  if (!profile) return { pct: 0, missing: [] }
  const checks: Array<{ key: ProfileFieldKey; weight: number; ok: boolean }> = [
    { key: "fullName",   weight: 20, ok: !!profile.full_name },
    { key: "jobTitle",   weight: 20, ok: !!profile.job_title },
    { key: "bio",        weight: 20, ok: !!profile.bio },
    { key: "skills",     weight: 15, ok: (profile.skills ?? []).length > 0 },
    { key: "avatar",     weight: 15, ok: !!profile.avatar_url },
    { key: "hourlyRate", weight: 10, ok: profile.hourly_rate != null },
  ]
  const pct = checks.filter((c) => c.ok).reduce((acc, c) => acc + c.weight, 0)
  const missing = checks.filter((c) => !c.ok).map((c) => c.key)
  return { pct, missing }
}

function initials(name: string | null, email?: string | null) {
  const src = name || email?.split("@")[0] || "?"
  return src.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
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

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
        >
          <Star
            className={`h-8 w-8 transition-colors ${
              n <= (hovered || value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function OrderRow({
  order, otherParty, role, hasReview, onReview, onStatusChange, t,
}: {
  order: Order
  otherParty: ProfileSnap | undefined
  role: "freelancer" | "client"
  hasReview?: boolean
  onReview?: () => void
  onStatusChange?: (orderId: string, newStatus: string) => void
  t: typeof translations["fr"]["dashboard"]
}) {
  const ini = otherParty?.full_name
    ? otherParty.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?"

  const showReviewAction = role === "client" && order.status === "livré"

  const nextStatuses: Record<string, Array<{ status: string; labelKey: "accept" | "cancel" | "markDelivered"; cls: string }>> = {
    en_attente: [
      { status: "en_cours", labelKey: "accept",       cls: "text-blue-600 hover:bg-blue-50" },
      { status: "annulé",   labelKey: "cancel",       cls: "text-red-600 hover:bg-red-50" },
    ],
    en_cours: [
      { status: "livré",  labelKey: "markDelivered", cls: "text-emerald-600 hover:bg-emerald-50" },
      { status: "annulé", labelKey: "cancel",        cls: "text-red-600 hover:bg-red-50" },
    ],
  }

  const actions = role === "freelancer" ? (nextStatuses[order.status] ?? []) : []

  function formatDate(ts: string) {
    return fmtDate(ts, lang)
  }

  return (
    <div className="rounded-xl border border-border bg-card hover:shadow-sm transition-shadow overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <div className="shrink-0">
          {otherParty?.avatar_url ? (
            <img src={otherParty.avatar_url} alt={otherParty.full_name ?? ""} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary">{ini}</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{order.service_title}</p>
          <p className="text-xs text-muted-foreground truncate">
            {role === "freelancer" ? t.orderRow.from : t.orderRow.for}
            {otherParty?.full_name ?? t.orderRow.user}
            {" · "}
            {formatDate(order.created_at)}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-sm font-black text-foreground">
            {formatPrice(order.price, lang)} MAD
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusClasses[order.status] ?? "bg-muted text-muted-foreground"}`}>
            {t.statuses[order.status] ?? order.status}
          </span>
        </div>
      </div>

      {showReviewAction && (
        <div className="px-4 py-2.5 border-t border-border/60 bg-muted/20 flex items-center">
          {hasReview ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t.orderRow.reviewDone}
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2.5 text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10 font-medium -ms-1.5"
              onClick={onReview}
            >
              <Star className="h-3.5 w-3.5" />
              {t.orderRow.leaveReview}
            </Button>
          )}
        </div>
      )}

      {actions.length > 0 && (
        <div className="px-4 py-2.5 border-t border-border/60 bg-muted/20 flex items-center gap-2">
          {actions.map((a) => (
            <Button
              key={a.status}
              variant="ghost"
              size="sm"
              className={`h-7 px-2.5 text-xs font-medium -ms-1.5 ${a.cls}`}
              onClick={() => onStatusChange?.(order.id, a.status)}
            >
              {t.orderRow[a.labelKey]}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

const statusClasses: Record<string, string> = {
  en_attente: "bg-amber-100 text-amber-700",
  en_cours: "bg-blue-100 text-blue-700",
  livré: "bg-emerald-100 text-emerald-700",
  annulé: "bg-red-100 text-red-600",
}

export default function DashboardPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const t = translations[lang].dashboard

  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [receivedOrders, setReceivedOrders] = useState<Order[]>([])
  const [sentOrders, setSentOrders] = useState<Order[]>([])
  const [profilesMap, setProfilesMap] = useState<Record<string, ProfileSnap>>({})
  const [reviewedOrderIds, setReviewedOrderIds] = useState<Set<string>>(new Set())
  const [reviewDialog, setReviewDialog] = useState<Order | null>(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  function memberSince(ts?: string | null) {
    if (!ts) return null
    return new Date(ts).toLocaleDateString(lang === "ar" ? "ar-MA-u-nu-arab" : "fr-FR", { month: "long", year: "numeric" })
  }

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace("/connexion"); return }
      setUser(user)

      const [
        { data: profileData },
        { data: servicesData },
        { data: receivedData },
        { data: sentData },
        { data: reviewsData },
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("services")
          .select("id, title, description, category, price, delivery_days, status, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase.from("orders").select("*").eq("freelancer_id", user.id)
          .order("created_at", { ascending: false }).limit(10),
        supabase.from("orders").select("*").eq("client_id", user.id)
          .order("created_at", { ascending: false }).limit(10),
        supabase.from("reviews").select("order_id").eq("client_id", user.id),
      ])

      setProfile(profileData ?? {
        id: user.id,
        full_name: (user.user_metadata?.full_name as string) ?? null,
        job_title: null, bio: null, skills: [], hourly_rate: null, portfolio_links: [], avatar_url: null,
      })
      setServices((servicesData as Service[]) ?? [])

      const received = (receivedData as Order[]) ?? []
      const sent = (sentData as Order[]) ?? []
      setReceivedOrders(received)
      setSentOrders(sent)
      setReviewedOrderIds(new Set(reviewsData?.map((r: { order_id: string }) => r.order_id) ?? []))

      const ids = new Set<string>()
      received.forEach((o) => ids.add(o.client_id))
      sent.forEach((o) => ids.add(o.freelancer_id))

      if (ids.size > 0) {
        const { data: profilesData } = await supabase
          .from("profiles").select("id, full_name, avatar_url").in("id", Array.from(ids))
        const map: Record<string, ProfileSnap> = {}
        profilesData?.forEach((p: { id: string; full_name: string | null; avatar_url: string | null }) => {
          map[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url }
        })
        setProfilesMap(map)
      }

      setLoading(false)
    })
  }, [router])

  async function handleSubmitReview() {
    if (!user || !reviewDialog || reviewRating === 0) return
    setReviewSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.from("reviews").insert({
      order_id: reviewDialog.id,
      client_id: user.id,
      freelancer_id: reviewDialog.freelancer_id,
      rating: reviewRating,
      comment: reviewComment.trim() || null,
    })
    if (!error) setReviewedOrderIds((prev) => new Set([...prev, reviewDialog.id]))
    setReviewDialog(null)
    setReviewRating(0)
    setReviewComment("")
    setReviewSubmitting(false)
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    const supabase = createClient()
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)
    if (error) return

    const order = receivedOrders.find((o) => o.id === orderId)
    setReceivedOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))

    if (order) {
      const myName = profile?.full_name ?? user?.email?.split("@")[0] ?? "Freelance"
      fetch("/api/emails/order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: order.client_id, freelancerName: myName, serviceTitle: order.service_title, newStatus, price: order.price }),
      }).catch(() => {})
    }
  }

  function openReviewDialog(order: Order) { setReviewDialog(order); setReviewRating(0); setReviewComment("") }
  function closeReviewDialog() { setReviewDialog(null); setReviewRating(0); setReviewComment("") }

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

  const pctColor = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-primary"
  const freelanceName = reviewDialog ? (profilesMap[reviewDialog.freelancer_id]?.full_name ?? t.orderRow.user) : ""

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background">
        <div className="relative">
          <ZelligeCover />
          <div className="absolute inset-0 flex items-end pb-5 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl w-full mx-auto">
              <p className="text-white/70 text-sm font-medium tracking-wide uppercase mb-0.5">
                {t.header}
              </p>
              <h1 className="text-xl sm:text-3xl font-black text-white drop-shadow truncate">
                {t.greeting}, {displayName.split(" ")[0]}
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Avatar + quick actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 pb-6 border-b border-border mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-white select-none">{ini}</span>
                )}
              </div>
              <div>
                <p className="font-bold text-foreground text-lg leading-tight">{displayName}</p>
                {profile.job_title && <p className="text-sm text-muted-foreground">{profile.job_title}</p>}
              </div>
            </div>

            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline" className="gap-1.5 font-medium">
                <Link href="/profil">
                  <Edit2 className="h-3.5 w-3.5" />
                  {t.editProfile}
                </Link>
              </Button>
              <Button asChild size="sm" className="gap-1.5 font-medium bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/services/nouveau">
                  <Plus className="h-3.5 w-3.5" />
                  {t.newService}
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { icon: Briefcase, value: publishedServices.length, label: t.stats.publishedServices },
              { icon: Package,   value: receivedOrders.length,   label: t.stats.receivedOrders },
              { icon: Star,      value: (profile.skills ?? []).length, label: t.stats.skills },
              { icon: TrendingUp,value: `${pct}%`,               label: t.stats.profileCompletion },
            ].map(({ icon: Icon, value, label }, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-sm flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-black text-foreground leading-none">{value}</p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Profile completion */}
          {pct < 100 && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm mb-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h2 className="font-bold text-foreground text-sm">{t.completion.title}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.completion.subtitle}</p>
                </div>
                <span className="text-xl font-black text-foreground shrink-0">{pct}%</span>
              </div>

              <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
                <div className={`h-full rounded-full transition-all duration-500 ${pctColor}`} style={{ width: `${pct}%` }} />
              </div>

              {missing.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {t.completion.missingTitle}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {missing.map((key) => (
                      <span key={key} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                        {t.profileFields[key]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Button asChild size="sm" variant="outline" className="mt-4 gap-1.5 font-medium text-xs">
                <Link href="/profil">
                  <User className="h-3.5 w-3.5" />
                  {t.completion.cta}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          )}

          {pct === 100 && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm mb-6 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">{t.completion.done}</p>
                <p className="text-xs text-emerald-700">{t.completion.doneSub}</p>
              </div>
            </div>
          )}

          {/* My services */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-foreground">{t.services.title}</h2>
              <Button asChild size="sm" variant="ghost" className="gap-1.5 text-primary hover:text-primary font-medium text-xs">
                <Link href="/services/nouveau">
                  <Plus className="h-3.5 w-3.5" />
                  {t.services.add}
                </Link>
              </Button>
            </div>

            {publishedServices.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-7 w-7 text-primary" />
                </div>
                <p className="font-bold text-foreground mb-1">{t.services.empty}</p>
                <p className="text-sm text-muted-foreground mb-5">{t.services.emptySub}</p>
                <Button asChild className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  <Link href="/services/nouveau">
                    <Plus className="h-4 w-4" />
                    {t.services.createBtn}
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {publishedServices.map((service) => (
                  <div key={service.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${CATEGORY_COLORS[service.category] ?? "bg-muted text-muted-foreground"}`}>
                        {getCategoryLabel(service.category, lang)}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold shrink-0">
                        <CheckCircle2 className="h-3 w-3" />
                        {t.services.published}
                      </span>
                    </div>

                    <h3 className="font-bold text-foreground text-sm leading-snug line-clamp-2">{service.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{service.description}</p>

                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-foreground text-base">
                          {formatPrice(service.price, lang)}{" "}
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
                          {t.services.edit}
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {publishedServices.length > 0 && (
              <div className="mt-4 text-center">
                <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground text-xs font-medium">
                  <Link href="/services">
                    {t.services.viewAll}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Received orders */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                {t.receivedOrders.title}
              </h2>
              {receivedOrders.length > 0 && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {receivedOrders.length}
                </span>
              )}
            </div>

            {receivedOrders.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <p className="font-bold text-foreground text-sm mb-1">{t.receivedOrders.empty}</p>
                <p className="text-xs text-muted-foreground">{t.receivedOrders.emptySub}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {receivedOrders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    otherParty={profilesMap[order.client_id]}
                    role="freelancer"
                    onStatusChange={handleStatusChange}
                    t={t}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sent orders */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                {t.sentOrders.title}
              </h2>
              {sentOrders.length > 0 && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {sentOrders.length}
                </span>
              )}
            </div>

            {sentOrders.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <p className="font-bold text-foreground text-sm mb-1">{t.sentOrders.empty}</p>
                <p className="text-xs text-muted-foreground mb-4">{t.sentOrders.emptySub}</p>
                <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5">
                  <Link href="/services">
                    {t.sentOrders.viewServicesBtn}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {sentOrders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    otherParty={profilesMap[order.freelancer_id]}
                    role="client"
                    hasReview={reviewedOrderIds.has(order.id)}
                    onReview={() => openReviewDialog(order)}
                    t={t}
                  />
                ))}
              </div>
            )}
          </div>

          {since && (
            <p className="text-center text-xs text-muted-foreground mt-10">
              {t.memberSince} {since}
            </p>
          )}
        </div>
      </main>

      {/* Review dialog */}
      <Dialog open={reviewDialog !== null} onOpenChange={(open) => { if (!open) closeReviewDialog() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.review.title}</DialogTitle>
            <DialogDescription>
              {lang === "ar"
                ? `قيّم تجربتك مع ${freelanceName} لـ "${reviewDialog?.service_title}".`
                : `Évaluez votre expérience avec ${freelanceName} pour "${reviewDialog?.service_title}".`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div>
              <p className="text-sm font-semibold mb-2 text-foreground">
                {t.review.ratingLabel} <span className="text-primary">*</span>
              </p>
              <StarPicker value={reviewRating} onChange={setReviewRating} />
              {reviewRating > 0 && (
                <p className="text-sm text-muted-foreground mt-1.5">{t.ratingLabels[reviewRating]}</p>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold mb-2 text-foreground">
                {t.review.commentLabel}{" "}
                <span className="text-muted-foreground font-normal">{t.review.optional}</span>
              </p>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder={t.review.placeholder}
                maxLength={500}
                rows={4}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors placeholder:text-muted-foreground/60"
              />
              <p className="text-xs text-muted-foreground text-end mt-1">{reviewComment.length}/500</p>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={closeReviewDialog} disabled={reviewSubmitting}>
              {t.review.cancelBtn}
            </Button>
            <Button
              disabled={reviewRating === 0 || reviewSubmitting}
              onClick={handleSubmitReview}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              {reviewSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.review.submitBtn}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
