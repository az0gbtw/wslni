"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { ServiceCard, type ServiceWithProfile } from "@/components/service-card"

export default function FavorisPage() {
  const { lang } = useLanguage()
  const t = translations[lang].favoris
  const tServices = translations[lang].services

  const [loading, setLoading]     = useState(true)
  const [userId, setUserId]       = useState<string | null>(null)
  const [services, setServices]   = useState<ServiceWithProfile[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      setUserId(user.id)

      const { data: favData } = await supabase
        .from("favorites")
        .select("service_id")
        .eq("user_id", user.id)

      const serviceIds = (favData ?? []).map((f: any) => f.service_id as string)
      setFavoriteIds(new Set(serviceIds))

      if (serviceIds.length === 0) {
        setLoading(false)
        return
      }

      const [{ data: servicesData }, { data: reviewsData }] = await Promise.all([
        supabase.from("services").select("*").in("id", serviceIds).eq("status", "published"),
        supabase.from("reviews").select("freelancer_id, rating"),
      ])

      const userIds = [...new Set((servicesData ?? []).map((s: any) => s.user_id as string))]
      const { data: profilesData } = userIds.length > 0
        ? await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, job_title, bio, city, languages, cin_status")
            .in("id", userIds)
        : { data: [] }

      const profileMap = Object.fromEntries((profilesData ?? []).map((p: any) => [p.id, p]))

      const ratingMap: Record<string, { sum: number; count: number }> = {}
      reviewsData?.forEach(({ freelancer_id, rating }: { freelancer_id: string; rating: number }) => {
        if (!ratingMap[freelancer_id]) ratingMap[freelancer_id] = { sum: 0, count: 0 }
        ratingMap[freelancer_id].sum += rating
        ratingMap[freelancer_id].count += 1
      })

      const enriched: ServiceWithProfile[] = (servicesData ?? [])
        .filter((s: any) => {
          const p = profileMap[s.user_id]
          return p?.full_name?.trim() && p?.job_title?.trim() && p?.bio?.trim()
        })
        .map((s: any) => {
          const r = ratingMap[s.user_id]
          return {
            ...s,
            profiles: profileMap[s.user_id] ?? null,
            avgRating: r ? r.sum / r.count : null,
            reviewCount: r?.count ?? 0,
          }
        })

      setServices(enriched)
      setLoading(false)
    }

    fetchData()
  }, [])

  function handleFavoriteToggle(serviceId: string, newState: boolean) {
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      if (newState) next.add(serviceId)
      else next.delete(serviceId)
      return next
    })
    if (!newState) {
      setServices((prev) => prev.filter((s) => s.id !== serviceId))
    }
  }

  return (
    <>
      <Navbar />
      <div className="pt-16 min-h-screen bg-background">
        <div className="bg-primary text-primary-foreground py-16 px-4">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-2xl sm:text-4xl font-bold mb-3">{t.title}</h1>
            <p className="text-primary-foreground/80 text-base sm:text-lg">{t.subtitle}</p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !userId ? (
            <div className="text-center py-24">
              <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-6">{t.notLoggedIn}</p>
              <Button asChild size="lg">
                <Link href="/connexion">{t.loginBtn}</Link>
              </Button>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-24">
              <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">{t.empty}</p>
              <Button asChild size="lg" variant="outline">
                <Link href="/services">{t.emptyLink}</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  t={tServices}
                  lang={lang}
                  isFavorited={favoriteIds.has(service.id)}
                  userId={userId}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
