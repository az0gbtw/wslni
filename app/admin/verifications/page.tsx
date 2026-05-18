"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Loader2, ShieldCheck, ShieldX, Eye, Shield } from "lucide-react"

interface PendingFreelancer {
  id: string
  full_name: string | null
  cin_uploaded_at: string | null
}

function formatDate(ts: string | null) {
  if (!ts) return "—"
  return new Date(ts).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}

export default function AdminVerificationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const [freelancers, setFreelancers] = useState<PendingFreelancer[]>([])
  const [actionLoading, setActionLoading] = useState<Record<string, "approve" | "reject" | null>>({})
  const [viewingUrl, setViewingUrl] = useState<Record<string, string | null>>({})
  const [viewLoading, setViewLoading] = useState<Record<string, boolean>>({})
  const [done, setDone] = useState<Record<string, string>>({})

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace("/connexion"); return }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profile?.role !== "admin") {
        setUnauthorized(true)
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, cin_uploaded_at")
        .eq("cin_status", "pending")
        .order("cin_uploaded_at", { ascending: true })

      setFreelancers(data ?? [])
      setLoading(false)
    })
  }, [router])

  async function handleViewCin(userId: string) {
    setViewLoading((v) => ({ ...v, [userId]: true }))
    setViewingUrl((v) => ({ ...v, [userId]: null }))
    const res = await fetch(`/api/admin/cin/signed-url?userId=${userId}`)
    const json = await res.json()
    setViewingUrl((v) => ({ ...v, [userId]: json.url ?? null }))
    setViewLoading((v) => ({ ...v, [userId]: false }))
    if (json.url) window.open(json.url, "_blank", "noopener,noreferrer")
  }

  async function handleAction(userId: string, action: "approve" | "reject") {
    setActionLoading((a) => ({ ...a, [userId]: action }))
    const res = await fetch("/api/admin/cin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, userId }),
    })
    if (res.ok) {
      setDone((d) => ({ ...d, [userId]: action }))
      setFreelancers((f) => f.filter((x) => x.id !== userId))
    }
    setActionLoading((a) => ({ ...a, [userId]: null }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (unauthorized) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Accès refusé</h1>
            <p className="text-muted-foreground text-sm">Vous n'avez pas les droits pour accéder à cette page.</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-black text-foreground">Vérifications CIN</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Examinez et approuvez ou refusez les demandes de vérification d'identité des freelances.
            </p>
          </div>

          {freelancers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-16 text-center">
              <ShieldCheck className="h-10 w-10 text-green-500 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground mb-1">Aucune vérification en attente</p>
              <p className="text-xs text-muted-foreground">Toutes les demandes ont été traitées.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {freelancers.map((f) => (
                <div
                  key={f.id}
                  className="rounded-xl border border-border bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  {/* Avatar placeholder + info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {(f.full_name ?? "?").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {f.full_name ?? "Utilisateur"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Soumis le {formatDate(f.cin_uploaded_at)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewCin(f.id)}
                      disabled={viewLoading[f.id]}
                    >
                      {viewLoading[f.id] ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                      Voir CIN
                    </Button>

                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleAction(f.id, "approve")}
                      disabled={!!actionLoading[f.id]}
                    >
                      {actionLoading[f.id] === "approve" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ShieldCheck className="h-3.5 w-3.5" />
                      )}
                      Approuver
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleAction(f.id, "reject")}
                      disabled={!!actionLoading[f.id]}
                    >
                      {actionLoading[f.id] === "reject" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ShieldX className="h-3.5 w-3.5" />
                      )}
                      Rejeter
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Processed entries feedback */}
          {Object.entries(done).length > 0 && (
            <div className="mt-6 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Traités dans cette session
              </p>
              {Object.entries(done).map(([uid, action]) => (
                <div
                  key={uid}
                  className={`text-xs px-3 py-2 rounded-lg border font-medium ${
                    action === "approve"
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  {uid.slice(0, 8)}… — {action === "approve" ? "Approuvé ✓" : "Refusé ✗"}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
