"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import Link from "next/link"
import { Search, Clock, Loader2, Plus, Star, SlidersHorizontal, X } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { CATEGORIES, CATEGORY_COLORS, getCategoryLabel } from "@/lib/categories"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ServiceWithProfile {
  id: string
  title: string
  description: string
  category: string
  price: number
  delivery_days: number
  created_at: string
  user_id: string
  avgRating: number | null
  reviewCount: number
  profiles: {
    id: string
    full_name: string | null
    avatar_url: string | null
    job_title: string | null
  } | null
}

const DELIVERY_OPTIONS = [
  { value: 0,  label: "Tous les délais" },
  { value: 1,  label: "Livraison en 24h" },
  { value: 3,  label: "Jusqu'à 3 jours" },
  { value: 7,  label: "Jusqu'à 7 jours" },
  { value: 14, label: "Jusqu'à 14 jours" },
  { value: 30, label: "Jusqu'à 30 jours" },
]

const SORT_OPTIONS = [
  { value: "newest",     label: "Plus récent" },
  { value: "price_asc",  label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "rating",     label: "Mieux noté" },
]

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <ServicesContent />
      </Suspense>
    </>
  )
}

function ServicesContent() {
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [services, setServices] = useState<ServiceWithProfile[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch]                     = useState(searchParams.get("q") ?? "")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [minPrice, setMinPrice]                 = useState("")
  const [maxPrice, setMaxPrice]                 = useState("")
  const [maxDelivery, setMaxDelivery]           = useState(0)
  const [minRating, setMinRating]               = useState(0)
  const [sortBy, setSortBy]                     = useState("newest")
  const [filtersOpen, setFiltersOpen]           = useState(false)

  useEffect(() => {
    async function fetchData() {
      const [{ data: servicesData }, { data: reviewsData }] = await Promise.all([
        supabase
          .from("services")
          .select("*, profiles (id, full_name, avatar_url, job_title)")
          .eq("status", "published"),
        supabase.from("reviews").select("freelancer_id, rating"),
      ])

      const ratingMap: Record<string, { sum: number; count: number }> = {}
      reviewsData?.forEach(({ freelancer_id, rating }: { freelancer_id: string; rating: number }) => {
        if (!ratingMap[freelancer_id]) ratingMap[freelancer_id] = { sum: 0, count: 0 }
        ratingMap[freelancer_id].sum += rating
        ratingMap[freelancer_id].count += 1
      })

      const enriched: ServiceWithProfile[] = (servicesData ?? []).map((s: ServiceWithProfile) => {
        const r = ratingMap[s.user_id]
        return { ...s, avgRating: r ? r.sum / r.count : null, reviewCount: r?.count ?? 0 }
      })

      setServices(enriched)
      setLoading(false)
    }
    fetchData()
  }, [])

  const filtered = useMemo(() => {
    const q   = search.toLowerCase().trim()
    const min = minPrice !== "" ? parseFloat(minPrice) : null
    const max = maxPrice !== "" ? parseFloat(maxPrice) : null

    let result = services.filter((s) => {
      if (q && !s.title.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q)) return false
      if (selectedCategory && s.category !== selectedCategory) return false
      if (min !== null && s.price < min) return false
      if (max !== null && s.price > max) return false
      if (maxDelivery > 0 && s.delivery_days > maxDelivery) return false
      if (minRating > 0 && (s.avgRating === null || s.avgRating < minRating)) return false
      return true
    })

    return [...result].sort((a, b) => {
      if (sortBy === "price_asc")  return a.price - b.price
      if (sortBy === "price_desc") return b.price - a.price
      if (sortBy === "rating")     return (b.avgRating ?? 0) - (a.avgRating ?? 0)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [services, search, selectedCategory, minPrice, maxPrice, maxDelivery, minRating, sortBy])

  const hasFilters = !!(search || selectedCategory || minPrice || maxPrice || maxDelivery > 0 || minRating > 0)

  function resetFilters() {
    setSearch("")
    setSelectedCategory("")
    setMinPrice("")
    setMaxPrice("")
    setMaxDelivery(0)
    setMinRating(0)
    setSortBy("newest")
  }

  return (
    <>
      {/* En-tête */}
      <div className="bg-primary text-primary-foreground py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-3">Services disponibles</h1>
              <p className="text-primary-foreground/80 text-lg max-w-xl">
                Trouvez le freelance idéal parmi les offres de services des talents marocains.
              </p>
            </div>
            <Button asChild variant="secondary" className="shrink-0 font-semibold">
              <Link href="/services/nouveau">
                <Plus className="mr-2 h-4 w-4" />
                Proposer un service
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Barre de recherche + tri */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre ou description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Bouton filtres (mobile) */}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden shrink-0 gap-2"
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
            {hasFilters && <span className="h-2 w-2 rounded-full bg-primary" />}
          </Button>

          {/* Tri */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="hidden sm:block h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shrink-0"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Corps : sidebar filtres + grille */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="lg:flex lg:gap-8 lg:items-start">

          {/* ── Panneau de filtres ── */}
          <aside className={`lg:w-64 lg:shrink-0 lg:sticky lg:top-24 mb-6 lg:mb-0 ${filtersOpen ? "block" : "hidden lg:block"}`}>
            <div className="rounded-2xl border border-border bg-card p-5 space-y-6">

              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Filtres</h2>
                {hasFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-primary hover:underline underline-offset-4 flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Réinitialiser
                  </button>
                )}
              </div>

              {/* Catégorie */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                  Catégorie
                </p>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {[{ value: "", label: "Toutes les catégories" }, ...CATEGORIES].map((cat) => (
                    <label key={cat.value} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        value={cat.value}
                        checked={selectedCategory === cat.value}
                        onChange={() => setSelectedCategory(cat.value)}
                        className="accent-primary shrink-0"
                      />
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors leading-tight">
                        {cat.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Fourchette de prix */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                  Prix (MAD)
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    min={0}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <span className="text-muted-foreground shrink-0">—</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    min={0}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              {/* Délai de livraison */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                  Délai de livraison
                </p>
                <div className="space-y-1.5">
                  {DELIVERY_OPTIONS.map((o) => (
                    <label key={o.value} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="delivery"
                        value={o.value}
                        checked={maxDelivery === o.value}
                        onChange={() => setMaxDelivery(o.value)}
                        className="accent-primary shrink-0"
                      />
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                        {o.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Note minimale */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                  Note minimale
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setMinRating(0)}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                      minRating === 0
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    Tous
                  </button>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      onClick={() => setMinRating(r)}
                      className={`flex items-center gap-0.5 text-xs px-2.5 py-1 rounded-md border transition-colors ${
                        minRating === r
                          ? "bg-amber-50 text-amber-700 border-amber-400 font-semibold"
                          : "bg-background text-muted-foreground border-border hover:border-amber-300"
                      }`}
                    >
                      {r}
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    </button>
                  ))}
                </div>
                {minRating > 0 && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {minRating === 5 ? "5 étoiles uniquement" : `${minRating} étoile${minRating > 1 ? "s" : ""} et plus`}
                  </p>
                )}
              </div>

              {/* Tri (mobile uniquement) */}
              <div className="sm:hidden">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                  Trier par
                </p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* ── Grille de résultats ── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-muted-foreground text-lg mb-2">Aucun service trouvé.</p>
                {hasFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-sm text-primary hover:underline underline-offset-4"
                  >
                    Effacer les filtres
                  </button>
                )}
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-5">
                  {filtered.length} service{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function StarDisplay({ rating }: { rating: number }) {
  const rounded = Math.round(rating)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3 w-3 ${
            n <= rounded
              ? "fill-amber-400 text-amber-400"
              : "fill-muted-foreground/10 text-muted-foreground/25"
          }`}
        />
      ))}
    </div>
  )
}

function ServiceCard({ service }: { service: ServiceWithProfile }) {
  const profile = service.profiles
  const categoryColor = CATEGORY_COLORS[service.category] ?? "bg-gray-100 text-gray-700"
  const categoryLabel = getCategoryLabel(service.category)
  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?"

  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="px-5 pt-5 pb-0">
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColor}`}>
          {categoryLabel}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-5 gap-3">
        <h2 className="text-base font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {service.title}
        </h2>
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
          {service.description}
        </p>

        {service.avgRating !== null && (
          <div className="flex items-center gap-1.5">
            <StarDisplay rating={service.avgRating} />
            <span className="text-xs text-muted-foreground">
              {service.avgRating.toFixed(1)}
              <span className="ml-1">({service.reviewCount} avis)</span>
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name ?? "Freelance"}
              className="h-7 w-7 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-primary">{initials}</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
              {profile?.full_name ?? "Freelance"}
            </p>
            {profile?.job_title && (
              <p className="text-xs text-muted-foreground truncate">{profile.job_title}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border px-5 py-3 bg-muted/30">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{service.delivery_days} jour{service.delivery_days > 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-primary">
            {service.price.toLocaleString("fr-MA")} MAD
          </span>
          <Button
            asChild
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-7 px-3"
          >
            <Link href={`/paiement/${service.id}`}>Contacter</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
