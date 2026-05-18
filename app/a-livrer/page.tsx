"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, PackageCheck } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { formatDate as fmtDate } from "@/lib/utils"
import { Navbar } from "@/components/navbar"

interface Order {
  id: string
  service_title: string
  price: number
  status: string
  client_id: string
  freelancer_id: string
  created_at: string
}

type ProfileSnap = { full_name: string | null; avatar_url: string | null }

const statusClasses: Record<string, string> = {
  en_attente: "bg-amber-100 text-amber-700",
  en_cours:   "bg-blue-100 text-blue-700",
  livré:      "bg-orange-100 text-orange-700",
  annulé:     "bg-red-100 text-red-600",
  terminé:    "bg-emerald-100 text-emerald-700",
}

export default function ALivrerPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const t = translations[lang].aLivrer
  const td = translations[lang].dashboard

  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [profilesMap, setProfilesMap] = useState<Record<string, ProfileSnap>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace("/connexion"); return }
      setUser(user)

      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, service_title, price, status, client_id, freelancer_id, created_at")
        .eq("freelancer_id", user.id)
        .neq("status", "terminé")
        .order("created_at", { ascending: false })

      const list = (ordersData as Order[]) ?? []
      setOrders(list)

      const clientIds = [...new Set(list.map((o) => o.client_id))]
      if (clientIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", clientIds)
        const map: Record<string, ProfileSnap> = {}
        profilesData?.forEach((p: { id: string; full_name: string | null; avatar_url: string | null }) => {
          map[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url }
        })
        setProfilesMap(map)
      }

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

  if (!user) return null

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">{t.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <PackageCheck className="h-7 w-7 text-primary" />
              </div>
              <p className="font-bold text-foreground mb-1">{t.empty}</p>
              <p className="text-sm text-muted-foreground">{t.emptySub}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const client = profilesMap[order.client_id]
                const ini = client?.full_name
                  ? client.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
                  : "?"

                return (
                  <div
                    key={order.id}
                    className="rounded-xl border border-border bg-card hover:shadow-sm transition-shadow overflow-hidden"
                  >
                    <div className="flex items-center gap-3 p-4">
                      <Link href={`/profil/${order.client_id}`} className="shrink-0 hover:opacity-80 transition-opacity">
                        {client?.avatar_url ? (
                          <img
                            src={client.avatar_url}
                            alt={client.full_name ?? ""}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">{ini}</span>
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{order.service_title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t.client} :{" "}
                          <Link
                            href={`/profil/${order.client_id}`}
                            className="font-medium text-foreground/70 hover:text-primary transition-colors"
                          >
                            {client?.full_name ?? "—"}
                          </Link>
                          <span className="mx-1">·</span>
                          {fmtDate(order.created_at, lang)}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-sm font-black text-foreground">
                          {order.price.toLocaleString()} MAD
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            statusClasses[order.status] ?? "bg-muted text-muted-foreground"
                          }`}
                        >
                          {td.statuses[order.status] ?? order.status}
                        </span>
                        <Link
                          href={`/commandes/${order.id}`}
                          className="text-[10px] font-medium text-primary hover:underline"
                        >
                          {t.viewDetails}
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
