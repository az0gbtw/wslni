"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import Link from "next/link"
import { Search, Clock, Loader2, Plus, Star, SlidersHorizontal, X, Palette, Code2, TrendingUp, Video, PenTool, Music, Briefcase, GraduationCap, Sparkles } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { CATEGORY_GROUPS, CATEGORY_COLORS, getCategoryLabel, getGroupForCategory, GROUP_GRADIENTS } from "@/lib/categories"
import { formatPrice } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ServiceWithProfile {
  id: string
  title: string
  description: string
  category: string
  category_group: string | null
  images: string[] | null
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

const GROUP_ICONS = [Palette, Code2, TrendingUp, Video, PenTool, Music, Briefcase, GraduationCap, Sparkles]

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
  const { lang } = useLanguage()
  const t = translations[lang].services
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [services, setServices] = useState<ServiceWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]                     = useState(searchParams.get("q") ?? "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") ?? "")
  const [selectedGroup, setSelectedGroup]       = useState(searchParams.get("group") ?? "")
  const [minPrice, setMinPrice]                 = useState("")
  const [maxPrice, setMaxPrice]                 = useState("")
  const [maxDelivery, setMaxDelivery]           = useState(0)
  const [minRating, setMinRating]               = useState(0)
  const [sortBy, setSortBy]                     = useState("newest")
  const [filtersOpen, setFiltersOpen]           = useState(false)

  const DELIVERY_OPTIONS = [
    { value: 0,  label: t.delivery.all },
    { value: 1,  label: t.delivery.day1 },
    { value: 3,  label: t.delivery.days3 },
    { value: 7,  label: t.delivery.days7 },
    { value: 14, label: t.delivery.days14 },
    { value: 30, label: t.delivery.days30 },
  ]

  const SORT_OPTIONS = [
    { value: "newest",     label: t.sort.newest },
    { value: "price_asc",  label: t.sort.priceAsc },
    { value: "price_desc", label: t.sort.priceDesc },
    { value: "rating",     label: t.sort.rating },
  ]

  useEffect(() => {
    async function fetchData() {
      const [{ data: servicesData }, { data: reviewsData }] = await Promise.all([
        supabase.from("services").select("*").eq("status", "published"),
        supabase.from("reviews").select("freelancer_id, rating"),
      ])

      const userIds = [...new Set((servicesData ?? []).map((s: any) => s.user_id as string))]
      const { data: profilesData } = userIds.length > 0
        ? await supabase.from("profiles").select("id, full_name, avatar_url, job_title").in("id", userIds)
        : { data: [] }

      const profileMap = Object.fromEntries((profilesData ?? []).map((p: any) => [p.id, p]))

      const ratingMap: Record<string, { sum: number; count: number }> = {}
      reviewsData?.forEach(({ freelancer_id, rating }: { freelancer_id: string; rating: number }) => {
        if (!ratingMap[freelancer_id]) ratingMap[freelancer_id] = { sum: 0, count: 0 }
        ratingMap[freelancer_id].sum += rating
        ratingMap[freelancer_id].count += 1
      })

      const enriched: ServiceWithProfile[] = (servicesData ?? []).map((s: any) => {
        const r = ratingMap[s.user_id]
        return { ...s, profiles: profileMap[s.user_id] ?? null, avgRating: r ? r.sum / r.count : null, reviewCount: r?.count ?? 0 }
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

    const groupSubcategories = selectedGroup
      ? CATEGORY_GROUPS.find((g) => g.value === selectedGroup)?.subcategories.map((s) => s.value) ?? []
      : []

    let result = services.filter((s) => {
      if (q && !s.title.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q)) return false
      if (selectedCategory && s.category !== selectedCategory) return false
      if (selectedGroup && !groupSubcategories.includes(s.category)) return false
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
  }, [services, search, selectedCategory, selectedGroup, minPrice, maxPrice, maxDelivery, minRating, sortBy])

  const hasFilters = !!(search || selectedCategory || selectedGroup || minPrice || maxPrice || maxDelivery > 0 || minRating > 0)

  function resetFilters() {
    setSearch(""); setSelectedCategory(""); setSelectedGroup(""); setMinPrice(""); setMaxPrice("")
    setMaxDelivery(0); setMinRating(0); setSortBy("newest")
  }

  return (
    <>
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-3">{t.header}</h1>
              <p className="text-primary-foreground/80 text-lg max-w-xl">{t.headerSub}</p>
            </div>
            <Button asChild variant="secondary" className="shrink-0 font-semibold">
              <Link href="/dashboard/new-service">
                <Plus className="me-2 h-4 w-4" />
                {t.offerBtn}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Search + sort bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="lg:hidden shrink-0 gap-2"
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t.filtersBtn}
            {hasFilters && <span className="h-2 w-2 rounded-full bg-primary" />}
          </Button>

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

      {/* Body: filters sidebar + results grid */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="lg:flex lg:gap-8 lg:items-start">

          {/* Filters panel */}
          <aside className={`lg:w-64 lg:shrink-0 lg:sticky lg:top-24 mb-6 lg:mb-0 ${filtersOpen ? "block" : "hidden lg:block"}`}>
            <div className="rounded-2xl border border-border bg-card p-5 space-y-6">

              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">{t.filtersTitle}</h2>
                {hasFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-primary hover:underline underline-offset-4 flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    {t.reset}
                  </button>
                )}
              </div>

              {/* Category */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                  {t.categoryLabel}
                </p>
                <select
                  value={selectedCategory || (selectedGroup ? `__group__${selectedGroup}` : "")}
                  onChange={(e) => {
                    const v = e.target.value
                    if (v.startsWith("__group__")) {
                      setSelectedGroup(v.replace("__group__", ""))
                      setSelectedCategory("")
                    } else {
                      setSelectedCategory(v)
                      setSelectedGroup("")
                    }
                  }}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">{t.allCategories}</option>
                  {CATEGORY_GROUPS.map((group) => {
                    const groupLabel = lang === "ar" ? (group.arLabel ?? group.label) : group.label
                    return (
                      <optgroup key={group.value} label={groupLabel}>
                        <option value={`__group__${group.value}`}>— {groupLabel} ({t.allSubcategories})</option>
                        {group.subcategories.map((sub) => {
                          const subLabel = lang === "ar" ? (sub.arLabel ?? sub.label) : sub.label
                          return (
                            <option key={sub.value} value={sub.value}>{subLabel}</option>
                          )
                        })}
                      </optgroup>
                    )
                  })}
                </select>
              </div>

              {/* Price range */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                  {t.priceLabel}
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

              {/* Delivery */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                  {t.deliveryLabel}
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

              {/* Min rating */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                  {t.ratingLabel}
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
                    {t.allRatings}
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
                    {minRating === 5 ? t.starsOnly : t.starsAndMore(minRating)}
                  </p>
                )}
              </div>

              {/* Sort (mobile only) */}
              <div className="sm:hidden">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                  {t.sortLabel}
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

          {/* Results grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-muted-foreground text-lg mb-2">{t.noResults}</p>
                {hasFilters && (
                  <button onClick={resetFilters} className="text-sm text-primary hover:underline underline-offset-4">
                    {t.clearFilters}
                  </button>
                )}
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-5">{t.servicesFound(filtered.length)}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((service) => (
                    <ServiceCard key={service.id} service={service} t={t} lang={lang} />
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
            n <= rounded ? "fill-amber-400 text-amber-400" : "fill-muted-foreground/10 text-muted-foreground/25"
          }`}
        />
      ))}
    </div>
  )
}

function ServiceCard({ service, t, lang }: { service: ServiceWithProfile; t: typeof translations["fr"]["services"]; lang: "fr" | "ar" }) {
  const profile = service.profiles
  const categoryColor = CATEGORY_COLORS[service.category] ?? "bg-gray-100 text-gray-700"
  const categoryLabel = getCategoryLabel(service.category, lang)
  const ini = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?"

  const coverImage = service.images?.[0] ?? null
  const groupValue = service.category_group ?? getGroupForCategory(service.category) ?? ""
  const groupIdx   = CATEGORY_GROUPS.findIndex((g) => g.value === groupValue)
  const GroupIcon  = GROUP_ICONS[groupIdx] ?? Palette
  const gradient   = GROUP_GRADIENTS[groupValue] ?? { bg: "from-gray-50 to-gray-100", icon: "text-gray-400" }

  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden">

      {/* ── Cover image 16:9 ── */}
      <Link href={`/services/${service.id}`} className="relative block aspect-video overflow-hidden bg-muted">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
            alt={service.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient.bg} flex items-center justify-center`}>
            <GroupIcon className={`h-12 w-12 opacity-40 ${gradient.icon}`} />
          </div>
        )}
      </Link>

      {/* ── Category badge ── */}
      <div className="px-5 pt-4 pb-0">
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColor}`}>
          {categoryLabel}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-5 pt-3 gap-3">
        <Link href={`/services/${service.id}`}>
          <h2 className="text-base font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {service.title}
          </h2>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{service.description}</p>

        {service.avgRating !== null && (
          <div className="flex items-center gap-1.5">
            <StarDisplay rating={service.avgRating} />
            <span className="text-xs text-muted-foreground">
              {service.avgRating.toFixed(1)}
              <span className="ms-1">({service.reviewCount} {t.reviews})</span>
            </span>
          </div>
        )}

        <Link
          href={`/profil/${service.user_id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 pt-1 hover:opacity-80 transition-opacity"
        >
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.full_name ?? "Freelance"}
              className="h-7 w-7 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-primary">{ini}</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{profile?.full_name ?? "Freelance"}</p>
            {profile?.job_title && <p className="text-xs text-muted-foreground truncate">{profile.job_title}</p>}
          </div>
        </Link>
      </div>

      <div className="flex items-center justify-between border-t border-border px-5 py-3 bg-muted/30">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{service.delivery_days} {service.delivery_days > 1 ? t.days : t.day}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-primary">
            {formatPrice(service.price, lang)} MAD
          </span>
          <Button
            asChild
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-7 px-3"
          >
            <Link href={`/paiement/${service.id}`}>{t.contact}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
