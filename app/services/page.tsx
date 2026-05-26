"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import Link from "next/link"
import {
  Search, Clock, Loader2, Plus, Star, SlidersHorizontal, X, ChevronRight,
  Palette, Code2, TrendingUp, Video, PenTool, Music, Briefcase,
  GraduationCap, Sparkles, ShieldCheck,
} from "lucide-react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { CATEGORY_GROUPS, getCategoryLabel, getGroupForCategory } from "@/lib/categories"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ContactSellerButton } from "@/components/contact-seller-button"
import { ServiceCard, type ServiceWithProfile } from "@/components/service-card"

const PAGE_SIZE = 12

const MOROCCAN_CITIES = [
  "Casablanca", "Rabat", "Salé", "Marrakech", "Fès", "Meknès", "Tanger",
  "Agadir", "Oujda", "Tétouan", "El Jadida", "Kenitra", "Laâyoune",
  "Dakhla", "Beni Mellal", "Settat", "Nador", "Mohammedia",
]

const LANGUAGE_OPTIONS = ["Darija", "Français", "Anglais", "Arabe classique", "Amazigh"]

function ServiceCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
      <div className="aspect-video bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gray-200 animate-pulse shrink-0" />
          <div className="h-3 w-24 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
        <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded" />
        <div className="pt-2 border-t border-border/40">
          <div className="h-4 w-1/4 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    </div>
  )
}

function ServicesPageSkeleton() {
  return (
    <div className="pt-16">
      <div className="bg-gradient-to-r from-red-50 via-orange-50/60 to-red-50 border-b border-red-100">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-5">
          <div className="h-3 w-28 bg-gray-200 animate-pulse rounded mb-3" />
          <div className="h-7 w-56 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="h-4 w-32 bg-gray-200 animate-pulse rounded mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )
}

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<ServicesPageSkeleton />}>
        <ServicesContent />
      </Suspense>
    </>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-2.5 py-1 font-medium animate-scaleIn">
      {label}
      <button onClick={onRemove} className="flex items-center hover:text-primary/70 transition-colors duration-150">
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}

function ServicesContent() {
  const { lang } = useLanguage()
  const t = translations[lang].services
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [services, setServices]                   = useState<ServiceWithProfile[]>([])
  const [loading, setLoading]                     = useState(true)
  const [loadingMore, setLoadingMore]             = useState(false)
  const [hasMore, setHasMore]                     = useState(true)
  const [offset, setOffset]                       = useState(0)
  const [ratingMap, setRatingMap]                 = useState<Record<string, { sum: number; count: number }>>({})
  const [profileMap, setProfileMap]               = useState<Record<string, any>>({})
  const [userId, setUserId]                       = useState<string | null>(null)
  const [favoriteIds, setFavoriteIds]             = useState<Set<string>>(new Set())
  const [search, setSearch]                       = useState(searchParams.get("q") ?? "")
  const [selectedCategory, setSelectedCategory]   = useState(searchParams.get("category") ?? "")
  const [selectedGroup, setSelectedGroup]         = useState(searchParams.get("group") ?? "")
  const [minPrice, setMinPrice]                   = useState("")
  const [maxPrice, setMaxPrice]                   = useState("")
  const [deliveryFilter, setDeliveryFilter]       = useState("")
  const [minRating, setMinRating]                 = useState(0)
  const [selectedCities, setSelectedCities]       = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [verifiedOnly, setVerifiedOnly]           = useState(false)
  const [sortBy, setSortBy]                       = useState("newest")
  const [filtersOpen, setFiltersOpen]             = useState(false)
  const [showAllCities, setShowAllCities]         = useState(false)

  const DELIVERY_OPTIONS = [
    { value: "",      label: t.delivery.all },
    { value: "1",     label: t.delivery.day1 },
    { value: "3",     label: t.delivery.days3 },
    { value: "7",     label: t.delivery.days7 },
    { value: "7plus", label: t.delivery.days7plus },
  ]

  const SORT_OPTIONS = [
    { value: "newest",     label: t.sort.newest },
    { value: "price_asc",  label: t.sort.priceAsc },
    { value: "price_desc", label: t.sort.priceDesc },
    { value: "rating",     label: t.sort.rating },
  ]

  async function fetchProfiles(userIds: string[], existingMap: Record<string, any>) {
    const newIds = userIds.filter((id) => !existingMap[id])
    if (newIds.length === 0) return existingMap
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, job_title, bio, city, languages, cin_status")
      .in("id", newIds)
    const updated = { ...existingMap }
    ;(data ?? []).forEach((p: any) => { updated[p.id] = p })
    return updated
  }

  async function enrichServices(
    rawServices: any[],
    currentRatingMap: Record<string, { sum: number; count: number }>,
    currentProfileMap: Record<string, any>,
  ): Promise<{ enriched: ServiceWithProfile[]; updatedProfileMap: Record<string, any> }> {
    const userIds = [...new Set(rawServices.map((s: any) => s.user_id as string))]
    const updatedProfileMap = await fetchProfiles(userIds, currentProfileMap)

    const enriched: ServiceWithProfile[] = rawServices
      .filter((s: any) => {
        const p = updatedProfileMap[s.user_id]
        return p?.full_name?.trim() && p?.job_title?.trim() && p?.bio?.trim()
      })
      .map((s: any) => {
        const r = currentRatingMap[s.user_id]
        return {
          ...s,
          profiles: updatedProfileMap[s.user_id] ?? null,
          avgRating: r ? r.sum / r.count : null,
          reviewCount: r?.count ?? 0,
        }
      })

    return { enriched, updatedProfileMap }
  }

  useEffect(() => {
    async function fetchInitial() {
      const [
        { data: servicesData },
        { data: reviewsData },
        { data: { user } },
      ] = await Promise.all([
        supabase
          .from("services")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .range(0, PAGE_SIZE - 1),
        supabase.from("reviews").select("freelancer_id, rating"),
        supabase.auth.getUser(),
      ])

      const newRatingMap: Record<string, { sum: number; count: number }> = {}
      reviewsData?.forEach(({ freelancer_id, rating }: { freelancer_id: string; rating: number }) => {
        if (!newRatingMap[freelancer_id]) newRatingMap[freelancer_id] = { sum: 0, count: 0 }
        newRatingMap[freelancer_id].sum += rating
        newRatingMap[freelancer_id].count += 1
      })
      setRatingMap(newRatingMap)

      const { enriched, updatedProfileMap } = await enrichServices(servicesData ?? [], newRatingMap, {})
      setProfileMap(updatedProfileMap)
      setServices(enriched)
      setOffset(PAGE_SIZE)
      setHasMore((servicesData ?? []).length === PAGE_SIZE)

      if (user) {
        setUserId(user.id)
        const { data: favData } = await supabase
          .from("favorites")
          .select("service_id")
          .eq("user_id", user.id)
        setFavoriteIds(new Set((favData ?? []).map((f: any) => f.service_id as string)))
      }

      setLoading(false)
    }
    fetchInitial()
  }, [])

  async function handleLoadMore() {
    setLoadingMore(true)
    const { data: moreServices } = await supabase
      .from("services")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    const batch = moreServices ?? []
    const { enriched, updatedProfileMap } = await enrichServices(batch, ratingMap, profileMap)
    setProfileMap(updatedProfileMap)
    setServices((prev) => [...prev, ...enriched])
    setOffset((prev) => prev + PAGE_SIZE)
    setHasMore(batch.length === PAGE_SIZE)
    setLoadingMore(false)
  }

  function handleFavoriteToggle(serviceId: string, newState: boolean) {
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      if (newState) next.add(serviceId)
      else next.delete(serviceId)
      return next
    })
  }

  const filtered = useMemo(() => {
    const q   = search.toLowerCase().trim()
    const min = minPrice !== "" ? parseFloat(minPrice) : null
    const max = maxPrice !== "" ? parseFloat(maxPrice) : null

    const groupSubcategories = selectedGroup
      ? CATEGORY_GROUPS.find((g) => g.value === selectedGroup)?.subcategories.map((s) => s.value) ?? []
      : []

    let result = services.filter((s) => {
      if (q) {
        const name = (s.profiles?.full_name ?? "").toLowerCase()
        if (!s.title.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q) && !name.includes(q)) return false
      }
      if (selectedCategory && s.category !== selectedCategory) return false
      if (selectedGroup && !groupSubcategories.includes(s.category)) return false
      if (min !== null && s.price < min) return false
      if (max !== null && s.price > max) return false
      if (deliveryFilter === "1"    && s.delivery_days > 1)  return false
      if (deliveryFilter === "3"    && s.delivery_days > 3)  return false
      if (deliveryFilter === "7"    && s.delivery_days > 7)  return false
      if (deliveryFilter === "7plus" && s.delivery_days <= 7) return false
      if (minRating > 0 && (s.avgRating === null || s.avgRating < minRating)) return false
      if (selectedCities.length > 0 && !selectedCities.includes(s.profiles?.city ?? "")) return false
      if (selectedLanguages.length > 0) {
        const profLangs = s.profiles?.languages ?? []
        if (!selectedLanguages.some((l) => profLangs.includes(l))) return false
      }
      if (verifiedOnly && s.profiles?.cin_status !== "verified") return false
      return true
    })

    return [...result].sort((a, b) => {
      if (sortBy === "price_asc")  return a.price - b.price
      if (sortBy === "price_desc") return b.price - a.price
      if (sortBy === "rating")     return (b.avgRating ?? 0) - (a.avgRating ?? 0)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [services, search, selectedCategory, selectedGroup, minPrice, maxPrice, deliveryFilter, minRating, selectedCities, selectedLanguages, verifiedOnly, sortBy])

  const hasFilters = !!(
    search || selectedCategory || selectedGroup || minPrice || maxPrice ||
    deliveryFilter || minRating > 0 || selectedCities.length > 0 || selectedLanguages.length > 0 || verifiedOnly
  )

  function resetFilters() {
    setSearch("")
    setSelectedCategory("")
    setSelectedGroup("")
    setMinPrice("")
    setMaxPrice("")
    setDeliveryFilter("")
    setMinRating(0)
    setSortBy("newest")
    setSelectedCities([])
    setSelectedLanguages([])
    setVerifiedOnly(false)
  }

  function toggleCity(city: string) {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    )
  }

  function toggleLanguage(option: string) {
    setSelectedLanguages((prev) =>
      prev.includes(option) ? prev.filter((l) => l !== option) : [...prev, option]
    )
  }

  const activeDeliveryLabel = DELIVERY_OPTIONS.find((o) => o.value === deliveryFilter)?.label ?? ""

  return (
    <>
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-red-50 via-orange-50/60 to-red-50 dark:from-red-950/20 dark:via-orange-950/10 dark:to-red-950/20 border-b border-red-100 dark:border-red-900/30">
        <div className="mx-auto max-w-7xl px-4 pt-20 pb-5 sm:pt-24 sm:pb-6">
          <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <Link href="/" className="hover:text-foreground transition-colors">Accueil</Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="text-foreground font-medium">Services</span>
          </nav>
          <div className="flex items-end justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Explorer les services</h1>
            <Button asChild variant="outline" size="sm" className="shrink-0 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 font-semibold hidden sm:flex">
              <Link href="/dashboard/new-service">
                <Plus className="me-2 h-4 w-4" />
                {t.offerBtn}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Body: filters sidebar + results grid */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex gap-8 items-start">

          {/* Filters panel */}
          <aside className={`w-72 shrink-0 sticky top-20 self-start lg:mb-0 ${filtersOpen ? "block" : "hidden lg:block"}`}>
            <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-6 shadow-sm">

              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">{t.filtersTitle}</h2>
                <div className="flex items-center gap-2">
                  {hasFilters && (
                    <button
                      onClick={resetFilters}
                      className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"
                    >
                      <X className="h-3 w-3" />
                      {t.reset}
                    </button>
                  )}
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Fermer les filtres"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Ville marocaine */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-2">
                  {t.cityLabel}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {(showAllCities ? MOROCCAN_CITIES : MOROCCAN_CITIES.slice(0, 8)).map((city) => {
                    const active = selectedCities.includes(city)
                    return (
                      <button
                        key={city}
                        onClick={() => toggleCity(city)}
                        className={`text-xs px-2 py-1 rounded-full border transition-all duration-150 truncate text-start ${
                          active
                            ? "bg-primary text-primary-foreground border-primary font-medium"
                            : "bg-transparent text-foreground border-border hover:border-primary/40 hover:text-primary"
                        }`}
                      >
                        {city}
                      </button>
                    )
                  })}
                </div>
                {MOROCCAN_CITIES.length > 8 && (
                  <button
                    onClick={() => setShowAllCities((v) => !v)}
                    className="mt-2 text-[11px] text-primary hover:underline underline-offset-4 font-medium"
                  >
                    {showAllCities ? "Voir moins ↑" : `Voir plus (${MOROCCAN_CITIES.length - 8}) ↓`}
                  </button>
                )}
              </div>

              <div className="border-t border-border/60" />

              {/* Langue de travail */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-2">
                  {t.languageLabel}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {LANGUAGE_OPTIONS.map((option) => {
                    const active = selectedLanguages.includes(option)
                    return (
                      <button
                        key={option}
                        onClick={() => toggleLanguage(option)}
                        className={`text-xs px-3 py-1 rounded-full border transition-all duration-150 ${
                          active
                            ? "bg-primary text-primary-foreground border-primary font-medium"
                            : "bg-muted/40 text-foreground border-border hover:border-primary/40 hover:text-primary"
                        }`}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="border-t border-border/60" />

              {/* Freelancer vérifié */}
              <div>
                <button
                  role="switch"
                  aria-checked={verifiedOnly}
                  onClick={() => setVerifiedOnly((v) => !v)}
                  className="flex items-center gap-3 w-full group"
                >
                  <div className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${verifiedOnly ? "bg-primary" : "bg-muted"}`}>
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${verifiedOnly ? "translate-x-4" : "translate-x-0"}`} />
                  </div>
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    {t.verifiedLabel}
                  </span>
                </button>
              </div>

              <div className="border-t border-border/60" />

              {/* Category */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-2">
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

              <div className="border-t border-border/60" />

              {/* Price range */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-2">
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

              <div className="border-t border-border/60" />

              {/* Delivery */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-2">
                  {t.deliveryLabel}
                </p>
                <div className="space-y-1.5">
                  {DELIVERY_OPTIONS.map((o) => (
                    <label key={o.value} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="delivery"
                        value={o.value}
                        checked={deliveryFilter === o.value}
                        onChange={() => setDeliveryFilter(o.value)}
                        className="accent-primary shrink-0"
                      />
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                        {o.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-border/60" />

              {/* Min rating */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-2">
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
                <div className="border-t border-border/60 mb-4" />
                <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-2">
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

          {/* Results column */}
          <div className="flex-1 min-w-0">

            {/* Search bar — scoped to results area width */}
            <div className="sticky top-16 z-40 -mx-4 px-4 py-3 mb-5 flex gap-3 items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border shadow-sm lg:static lg:mx-0 lg:px-0 lg:py-0 lg:mb-5 lg:bg-transparent lg:backdrop-blur-none lg:border-0 lg:shadow-none">
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
            </div>

            {/* Active filter chips */}
            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {search && (
                  <FilterChip label={`"${search}"`} onRemove={() => setSearch("")} />
                )}
                {selectedCities.map((city) => (
                  <FilterChip key={city} label={city} onRemove={() => toggleCity(city)} />
                ))}
                {selectedLanguages.map((l) => (
                  <FilterChip key={l} label={l} onRemove={() => toggleLanguage(l)} />
                ))}
                {verifiedOnly && (
                  <FilterChip label={t.verifiedChip} onRemove={() => setVerifiedOnly(false)} />
                )}
                {(selectedCategory || selectedGroup) && (
                  <FilterChip
                    label={
                      selectedCategory
                        ? getCategoryLabel(selectedCategory, lang)
                        : (CATEGORY_GROUPS.find((g) => g.value === selectedGroup)?.label ?? selectedGroup)
                    }
                    onRemove={() => { setSelectedCategory(""); setSelectedGroup("") }}
                  />
                )}
                {(minPrice || maxPrice) && (
                  <FilterChip
                    label={`${minPrice || "0"} — ${maxPrice || "∞"} MAD`}
                    onRemove={() => { setMinPrice(""); setMaxPrice("") }}
                  />
                )}
                {deliveryFilter && (
                  <FilterChip label={activeDeliveryLabel} onRemove={() => setDeliveryFilter("")} />
                )}
                {minRating > 0 && (
                  <FilterChip
                    label={minRating === 5 ? t.starsOnly : t.starsAndMore(minRating)}
                    onRemove={() => setMinRating(0)}
                  />
                )}
                <button
                  onClick={resetFilters}
                  className="text-xs text-muted-foreground hover:text-primary hover:underline underline-offset-4 ms-1"
                >
                  {t.resetAll}
                </button>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center py-20 text-center animate-fadeIn">
                <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6" aria-hidden="true">
                  <circle cx="38" cy="38" r="28" fill="#FEE2E2"/>
                  <circle cx="38" cy="38" r="28" stroke="#FCA5A5" strokeWidth="2.5"/>
                  <line x1="57" y1="57" x2="84" y2="84" stroke="#F87171" strokeWidth="5" strokeLinecap="round"/>
                  <line x1="28" y1="28" x2="48" y2="48" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"/>
                  <line x1="48" y1="28" x2="28" y2="48" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"/>
                  <circle cx="84" cy="12" r="4" fill="#FECACA"/>
                  <circle cx="8" cy="72" r="3" fill="#FEE2E2" stroke="#FCA5A5" strokeWidth="1.5"/>
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun résultat trouvé</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">Aucun service ne correspond à vos critères. Essayez de modifier vos filtres.</p>
                {hasFilters && (
                  <button
                    onClick={resetFilters}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 py-3 font-semibold text-sm transition-colors"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
                  <p className="text-foreground font-bold text-base">
                    <span className="text-primary font-extrabold text-xl me-1">{filtered.length}</span>
                    {t.servicesFound(filtered.length).replace(/^\d+\s?/, "")}
                  </p>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-9 rounded-lg border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shrink-0"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filtered.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      t={t}
                      lang={lang}
                      isFavorited={favoriteIds.has(service.id)}
                      userId={userId}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  ))}
                </div>

                {/* Load more */}
                <div className="mt-10 flex flex-col items-center gap-2">
                  {hasMore ? (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="min-w-[160px]"
                    >
                      {loadingMore ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        t.loadMore
                      )}
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">{t.allLoaded}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
