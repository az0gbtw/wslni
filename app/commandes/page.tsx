"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Loader2, Package, ShoppingBag, Star, CheckCircle2, ArrowRight,
  Download, FileText, Upload,
} from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { formatDate as fmtDate } from "@/lib/utils"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"

interface Order {
  id: string
  service_id: string
  service_title: string
  price: number
  status: string
  client_id: string
  freelancer_id: string
  created_at: string
  deliverable_url?: string | null
  deliverable_filename?: string | null
  completion_note?: string | null
}

type ProfileSnap = { full_name: string | null; avatar_url: string | null }

const statusClasses: Record<string, string> = {
  en_attente: "bg-amber-100 text-amber-700",
  en_cours: "bg-blue-100 text-blue-700",
  livré: "bg-orange-100 text-orange-700",
  annulé: "bg-red-100 text-red-600",
  terminé: "bg-emerald-100 text-emerald-700",
}

const nextStatuses: Record<string, Array<{ status: string; labelKey: "accept" | "cancel" | "markDelivered"; cls: string }>> = {
  en_attente: [
    { status: "en_cours", labelKey: "accept", cls: "text-blue-600 hover:bg-blue-50" },
    { status: "annulé",   labelKey: "cancel", cls: "text-red-600 hover:bg-red-50" },
  ],
  en_cours: [
    { status: "livré", labelKey: "markDelivered", cls: "text-emerald-600 hover:bg-emerald-50" },
  ],
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

function OrderCard({
  order,
  otherParty,
  role,
  hasReview,
  onReview,
  onStatusChange,
  onMarkDelivered,
  onDownload,
  formatDate,
  td,
}: {
  order: Order
  otherParty: ProfileSnap | undefined
  role: "client" | "freelancer"
  hasReview?: boolean
  onReview?: () => void
  onStatusChange: (orderId: string, newStatus: string) => void
  onMarkDelivered?: (order: Order) => void
  onDownload?: (order: Order) => void
  formatDate: (ts: string) => string
  td: typeof translations["fr"]["dashboard"]
}) {
  const ini = otherParty?.full_name
    ? otherParty.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?"

  const actions = role === "freelancer" ? (nextStatuses[order.status] ?? []) : []

  return (
    <div className="rounded-xl border border-border bg-card hover:shadow-sm transition-shadow overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <div className="shrink-0">
          {otherParty?.avatar_url ? (
            <img
              src={otherParty.avatar_url}
              alt={otherParty.full_name ?? ""}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{ini}</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{order.service_title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {role === "freelancer" ? td.orderRow.from : td.orderRow.for}
            <span className="font-medium text-foreground/70">
              {otherParty?.full_name ?? td.orderRow.user}
            </span>
            <span className="mx-1">·</span>
            {formatDate(order.created_at)}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-sm font-black text-foreground">
            {order.price.toLocaleString()} MAD
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusClasses[order.status] ?? "bg-muted text-muted-foreground"}`}>
            {td.statuses[order.status] ?? order.status}
          </span>
        </div>
      </div>

      {order.status === "terminé" ? (
        <div className="px-4 py-2.5 border-t border-border/60 bg-muted/20 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {td.statuses["terminé"]}
          </span>
          {role === "client" && (
            hasReview ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {td.orderRow.reviewDone}
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2.5 text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10 font-medium"
                onClick={onReview}
              >
                <Star className="h-3.5 w-3.5" />
                {td.orderRow.leaveReview}
              </Button>
            )
          )}
        </div>
      ) : order.status === "livré" ? (
        <div className="px-4 py-3 border-t border-border/60 bg-muted/20 flex flex-col gap-2">
          {/* Deliverable or completion note (shown to both parties) */}
          {order.deliverable_url && order.deliverable_filename && (
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground truncate flex-1">
                {order.deliverable_filename}
              </span>
              {role === "client" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs gap-1 text-primary hover:bg-primary/10 font-medium shrink-0"
                  onClick={() => onDownload?.(order)}
                >
                  <Download className="h-3 w-3" />
                  {td.orderRow.downloadBtn}
                </Button>
              )}
            </div>
          )}
          {order.completion_note && (
            <div className="rounded-md bg-background border border-border/60 px-3 py-2">
              <p className="text-[10px] font-semibold text-muted-foreground mb-0.5 uppercase tracking-wide">
                {td.orderRow.completionNoteLabel}
              </p>
              <p className="text-xs text-foreground">{order.completion_note}</p>
            </div>
          )}
          {/* Action row */}
          <div className="flex items-center">
            {role === "freelancer" ? (
              <span className="text-xs text-amber-600 font-medium italic">
                {td.orderRow.awaitingConfirmation}
              </span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2.5 text-xs gap-1.5 font-medium -ms-1.5 text-emerald-600 hover:bg-emerald-50"
                onClick={() => onStatusChange(order.id, "terminé")}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {td.orderRow.confirmDelivery}
              </Button>
            )}
          </div>
        </div>
      ) : actions.length > 0 ? (
        <div className="px-4 py-2.5 border-t border-border/60 bg-muted/20 flex items-center gap-2">
          {actions.map((a) => (
            <Button
              key={a.status}
              variant="ghost"
              size="sm"
              className={`h-7 px-2.5 text-xs font-medium -ms-1.5 ${a.cls}`}
              onClick={() => {
                if (a.labelKey === "markDelivered") {
                  onMarkDelivered?.(order)
                } else {
                  onStatusChange(order.id, a.status)
                }
              }}
            >
              {td.orderRow[a.labelKey]}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default function CommandesPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const td = translations[lang].dashboard
  const to = translations[lang].orders
  const dm = translations[lang].dashboard.deliveryModal

  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [tab, setTab] = useState<"client" | "freelancer">("client")
  const [receivedOrders, setReceivedOrders] = useState<Order[]>([])
  const [sentOrders, setSentOrders] = useState<Order[]>([])
  const [profilesMap, setProfilesMap] = useState<Record<string, ProfileSnap>>({})
  const [reviewedOrderIds, setReviewedOrderIds] = useState<Set<string>>(new Set())
  const [reviewDialog, setReviewDialog] = useState<Order | null>(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  // Delivery modal state
  const [deliveryDialog, setDeliveryDialog] = useState<Order | null>(null)
  const [deliveryMode, setDeliveryMode] = useState<"file" | "note">("file")
  const [deliveryFile, setDeliveryFile] = useState<File | null>(null)
  const [completionNote, setCompletionNote] = useState("")
  const [deliverySubmitting, setDeliverySubmitting] = useState(false)
  const [deliveryError, setDeliveryError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace("/connexion"); return }
      setUser(user)

      const [
        { data: receivedData },
        { data: sentData },
        { data: reviewsData },
      ] = await Promise.all([
        supabase.from("orders").select("*").eq("freelancer_id", user.id)
          .order("created_at", { ascending: false }),
        supabase.from("orders").select("*").eq("client_id", user.id)
          .order("created_at", { ascending: false }),
        supabase.from("reviews").select("order_id").eq("client_id", user.id),
      ])

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

  async function handleClientStatusChange(orderId: string, newStatus: string) {
    const supabase = createClient()
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)
    if (error) return
    setSentOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    const supabase = createClient()
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)
    if (error) return

    const order = receivedOrders.find((o) => o.id === orderId)
    setReceivedOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))

    if (order) {
      fetch("/api/emails/order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: order.client_id,
          freelancerName: user?.email?.split("@")[0] ?? "Freelance",
          serviceTitle: order.service_title,
          newStatus,
          price: order.price,
        }),
      }).catch(() => {})
    }
  }

  function openDeliveryModal(order: Order) {
    setDeliveryDialog(order)
    setDeliveryMode("file")
    setDeliveryFile(null)
    setCompletionNote("")
    setDeliveryError("")
  }

  function closeDeliveryModal() {
    setDeliveryDialog(null)
    setDeliveryFile(null)
    setCompletionNote("")
    setDeliveryError("")
  }

  async function handleDeliverySubmit() {
    if (!deliveryDialog || !user) return
    setDeliveryError("")

    const MAX_SIZE = 50 * 1024 * 1024 // 50 MB

    if (deliveryMode === "file") {
      if (!deliveryFile) { setDeliveryError(dm.fileError); return }
      if (deliveryFile.size > MAX_SIZE) { setDeliveryError(dm.fileTooLarge); return }

      setDeliverySubmitting(true)
      const supabase = createClient()
      const filePath = `orders/${deliveryDialog.id}/${deliveryFile.name}`

      const { error: uploadError } = await supabase.storage
        .from("order-deliverables")
        .upload(filePath, deliveryFile, { upsert: true })

      if (uploadError) {
        setDeliveryError(dm.uploadError)
        setDeliverySubmitting(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from("order-deliverables")
        .getPublicUrl(filePath)

      const { error } = await supabase.from("orders").update({
        status: "livré",
        deliverable_url: publicUrl,
        deliverable_filename: deliveryFile.name,
      }).eq("id", deliveryDialog.id)

      if (error) {
        setDeliveryError(dm.saveError)
        setDeliverySubmitting(false)
        return
      }

      setReceivedOrders((prev) => prev.map((o) =>
        o.id === deliveryDialog.id
          ? { ...o, status: "livré", deliverable_url: publicUrl, deliverable_filename: deliveryFile.name }
          : o
      ))
    } else {
      if (!completionNote.trim()) { setDeliveryError(dm.noteError); return }

      setDeliverySubmitting(true)
      const supabase = createClient()

      const { error } = await supabase.from("orders").update({
        status: "livré",
        completion_note: completionNote.trim(),
      }).eq("id", deliveryDialog.id)

      if (error) {
        setDeliveryError(dm.saveError)
        setDeliverySubmitting(false)
        return
      }

      setReceivedOrders((prev) => prev.map((o) =>
        o.id === deliveryDialog.id
          ? { ...o, status: "livré", completion_note: completionNote.trim() }
          : o
      ))
    }

    // Notify client by email
    fetch("/api/emails/order-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: deliveryDialog.client_id,
        freelancerName: user?.email?.split("@")[0] ?? "Freelance",
        serviceTitle: deliveryDialog.service_title,
        newStatus: "livré",
        price: deliveryDialog.price,
      }),
    }).catch(() => {})

    closeDeliveryModal()
    setDeliverySubmitting(false)
  }

  async function handleDownload(order: Order) {
    if (!order.deliverable_url) return
    window.open(order.deliverable_url, "_blank", "noopener,noreferrer")
  }

  function formatDate(ts: string) {
    return fmtDate(ts, lang)
  }

  function openReview(order: Order) {
    setReviewDialog(order)
    setReviewRating(0)
    setReviewComment("")
  }

  function closeReview() {
    setReviewDialog(null)
    setReviewRating(0)
    setReviewComment("")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  const freelanceName = reviewDialog
    ? (profilesMap[reviewDialog.freelancer_id]?.full_name ?? td.orderRow.user)
    : ""

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">{to.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{to.subtitle}</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-border">
            <button
              onClick={() => setTab("client")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors -mb-px border-b-2 ${
                tab === "client"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              {to.tabClient}
              {sentOrders.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {sentOrders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab("freelancer")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors -mb-px border-b-2 ${
                tab === "freelancer"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Package className="h-4 w-4" />
              {to.tabFreelancer}
              {receivedOrders.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {receivedOrders.length}
                </span>
              )}
            </button>
          </div>

          {/* Client orders */}
          {tab === "client" && (
            sentOrders.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-7 w-7 text-primary" />
                </div>
                <p className="font-bold text-foreground mb-1">{to.emptyClient}</p>
                <p className="text-sm text-muted-foreground mb-5">{to.emptyClientSub}</p>
                <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5">
                  <Link href="/services">
                    {to.viewServices}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {sentOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    otherParty={profilesMap[order.freelancer_id]}
                    role="client"
                    hasReview={reviewedOrderIds.has(order.id)}
                    onReview={() => openReview(order)}
                    onStatusChange={handleClientStatusChange}
                    onDownload={handleDownload}
                    formatDate={formatDate}
                    td={td}
                  />
                ))}
              </div>
            )
          )}

          {/* Freelancer orders */}
          {tab === "freelancer" && (
            receivedOrders.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Package className="h-7 w-7 text-primary" />
                </div>
                <p className="font-bold text-foreground mb-1">{to.emptyFreelancer}</p>
                <p className="text-sm text-muted-foreground">{to.emptyFreelancerSub}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {receivedOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    otherParty={profilesMap[order.client_id]}
                    role="freelancer"
                    onStatusChange={handleStatusChange}
                    onMarkDelivered={openDeliveryModal}
                    formatDate={formatDate}
                    td={td}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </main>

      {/* Review dialog */}
      <Dialog open={reviewDialog !== null} onOpenChange={(open) => { if (!open) closeReview() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{td.review.title}</DialogTitle>
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
                {td.review.ratingLabel} <span className="text-primary">*</span>
              </p>
              <StarPicker value={reviewRating} onChange={setReviewRating} />
              {reviewRating > 0 && (
                <p className="text-sm text-muted-foreground mt-1.5">{td.ratingLabels[reviewRating]}</p>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold mb-2 text-foreground">
                {td.review.commentLabel}{" "}
                <span className="text-muted-foreground font-normal">{td.review.optional}</span>
              </p>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder={td.review.placeholder}
                maxLength={500}
                rows={4}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors placeholder:text-muted-foreground/60"
              />
              <p className="text-xs text-muted-foreground text-end mt-1">{reviewComment.length}/500</p>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={closeReview} disabled={reviewSubmitting}>
              {td.review.cancelBtn}
            </Button>
            <Button
              disabled={reviewRating === 0 || reviewSubmitting}
              onClick={handleSubmitReview}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              {reviewSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {td.review.submitBtn}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delivery modal */}
      <Dialog open={deliveryDialog !== null} onOpenChange={(open) => { if (!open) closeDeliveryModal() }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{dm.title}</DialogTitle>
            <DialogDescription>
              {deliveryDialog?.service_title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-1">
            {/* Option 1 — File */}
            <button
              type="button"
              onClick={() => setDeliveryMode("file")}
              className={`w-full text-start rounded-xl border-2 p-4 transition-colors ${
                deliveryMode === "file"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-border/80 hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  deliveryMode === "file" ? "border-primary" : "border-muted-foreground/40"
                }`}>
                  {deliveryMode === "file" && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <span className="text-sm font-semibold text-foreground">{dm.option1}</span>
              </div>
              <p className="text-xs text-muted-foreground ms-7">{dm.option1Desc}</p>
            </button>

            {deliveryMode === "file" && (
              <div className="ms-4 space-y-2">
                <p className="text-xs font-medium text-foreground">{dm.uploadLabel}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3,.png,.jpg,.jpeg,.gif,.pdf,.zip,.rar,.svg,.psd,.ai,.wav,.mp4,.mov"
                  className="hidden"
                  onChange={(e) => {
                    setDeliveryFile(e.target.files?.[0] ?? null)
                    setDeliveryError("")
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors py-5 flex flex-col items-center gap-2 text-sm text-muted-foreground"
                >
                  <Upload className="h-5 w-5" />
                  {deliveryFile
                    ? <span className="text-foreground font-medium text-xs truncate max-w-[240px]">{deliveryFile.name}</span>
                    : <span>Cliquer pour choisir un fichier</span>
                  }
                </button>
              </div>
            )}

            {/* Option 2 — Note */}
            <button
              type="button"
              onClick={() => setDeliveryMode("note")}
              className={`w-full text-start rounded-xl border-2 p-4 transition-colors ${
                deliveryMode === "note"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-border/80 hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  deliveryMode === "note" ? "border-primary" : "border-muted-foreground/40"
                }`}>
                  {deliveryMode === "note" && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <span className="text-sm font-semibold text-foreground">{dm.option2}</span>
              </div>
              <p className="text-xs text-muted-foreground ms-7">{dm.option2Desc}</p>
            </button>

            {deliveryMode === "note" && (
              <div className="ms-4 space-y-2">
                <p className="text-xs font-medium text-foreground">{dm.noteLabel}</p>
                <textarea
                  value={completionNote}
                  onChange={(e) => { setCompletionNote(e.target.value); setDeliveryError("") }}
                  placeholder={dm.notePlaceholder}
                  maxLength={500}
                  rows={4}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors placeholder:text-muted-foreground/60"
                />
                <p className="text-xs text-muted-foreground text-end">{completionNote.length}/500</p>
              </div>
            )}

            {deliveryError && (
              <p className="text-xs text-red-600 font-medium">{deliveryError}</p>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={closeDeliveryModal} disabled={deliverySubmitting}>
              Annuler
            </Button>
            <Button
              disabled={deliverySubmitting}
              onClick={handleDeliverySubmit}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              {deliverySubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {deliveryMode === "file" ? dm.sendBtn : dm.doneBtn}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
