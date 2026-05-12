"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Search, Clock, Loader2, Plus } from "lucide-react"
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
  profiles: {
    id: string
    full_name: string | null
    avatar_url: string | null
    job_title: string | null
  } | null
}

export default function ServicesPage() {
  const supabase = createClient()
  const [services, setServices] = useState<ServiceWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  useEffect(() => {
    async function fetchServices() {
      const { data } = await supabase
        .from("services")
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url,
            job_title
          )
        `)
        .eq("status", "published")
        .order("created_at", { ascending: false })
      setServices((data as ServiceWithProfile[]) ?? [])
      setLoading(false)
    }
    fetchServices()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return services.filter((s) => {
      const matchesSearch =
        !q || s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      const matchesCategory = !selectedCategory || s.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [services, search, selectedCategory])

  return (
    <>
      <Navbar />

      {/* Page header */}
      <div className="bg-primary text-primary-foreground py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-3">Services disponibles</h1>
              <p className="text-primary-foreground/80 text-lg max-w-xl">
                Trouvez le freelance idéal parmi les offres de services des talents marocains.
              </p>
            </div>
            <Button
              asChild
              variant="secondary"
              className="shrink-0 font-semibold"
            >
              <Link href="/services/nouveau">
                <Plus className="mr-2 h-4 w-4" />
                Proposer un service
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un service…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-64"
          >
            <option value="">Toutes les catégories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground text-lg mb-2">Aucun service trouvé.</p>
            {(search || selectedCategory) && (
              <button
                onClick={() => { setSearch(""); setSelectedCategory("") }}
                className="text-sm text-primary hover:underline underline-offset-4"
              >
                Effacer les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              {filtered.length} service{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
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
      {/* Category badge */}
      <div className="px-5 pt-5 pb-0">
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColor}`}>
          {categoryLabel}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <h2 className="text-base font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {service.title}
        </h2>
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
          {service.description}
        </p>

        {/* Freelancer */}
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

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border px-5 py-3 bg-muted/30">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{service.delivery_days} jour{service.delivery_days > 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-primary">
            {service.price.toLocaleString("fr-MA")} MAD
          </span>
          <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-7 px-3">
            <Link href={`/paiement/${service.id}`}>Contacter</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
