"use client"

import { use, useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ar as arLocale, fr as frLocale } from "date-fns/locale"
import {
  Loader2, ArrowLeft, Send, MessageSquare, Calendar, Lock, X,
} from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Order {
  id: string
  service_title: string
  price: number
  status: string
  client_id: string
  freelancer_id: string
  created_at: string
}

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string | null) {
  if (!name) return "?"
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

function Avatar({ profile, size = "sm" }: { profile: Profile; size?: "sm" | "md" }) {
  const cls = size === "md" ? "h-9 w-9 text-sm" : "h-7 w-7 text-xs"
  return (
    <div
      className={cn(
        "relative rounded-full bg-primary overflow-hidden flex items-center justify-center shrink-0 font-semibold text-white select-none",
        cls
      )}
    >
      {profile.avatar_url ? (
        <Image src={profile.avatar_url} alt={profile.full_name || ""} fill sizes="36px" className="object-cover" />
      ) : (
        getInitials(profile.full_name)
      )}
    </div>
  )
}

const statusClasses: Record<string, string> = {
  en_attente: "bg-amber-100 text-amber-700",
  en_cours:   "bg-blue-100 text-blue-700",
  livré:      "bg-orange-100 text-orange-700",
  annulé:     "bg-red-100 text-red-600",
  terminé:    "bg-emerald-100 text-emerald-700",
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const BANNER_KEY = "wslni_protect_banner_dismissed"

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { lang } = useLanguage()
  const t = translations[lang].orderDetail
  const tm = translations[lang].messages
  const locale = lang === "ar" ? arLocale : frLocale
  const supabase = useMemo(() => createClient(), [])
  const { toast } = useToast()

  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [bannerDismissed, setBannerDismissed] = useState(true)
  const [order, setOrder] = useState<Order | null | undefined>(undefined)
  const [clientProfile, setClientProfile] = useState<Profile | null>(null)
  const [freelancerProfile, setFreelancerProfile] = useState<Profile | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [loadingMsgs, setLoadingMsgs] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setBannerDismissed(localStorage.getItem(BANNER_KEY) === "1")
  }, [])

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ── Auth + order + profiles + conversation ───────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      if (!u) { router.replace("/connexion"); return }
      setUser(u)

      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single()

      if (
        !orderData ||
        (orderData.client_id !== u.id && orderData.freelancer_id !== u.id)
      ) {
        setOrder(null)
        return
      }

      setOrder(orderData as Order)

      const [{ data: cp }, { data: fp }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, avatar_url").eq("id", orderData.client_id).single(),
        supabase.from("profiles").select("id, full_name, avatar_url").eq("id", orderData.freelancer_id).single(),
      ])
      setClientProfile(cp as Profile)
      setFreelancerProfile(fp as Profile)

      // Get or create the shared conversation between client and freelancer
      const otherPartyId = orderData.client_id === u.id
        ? orderData.freelancer_id
        : orderData.client_id

      const res = await fetch("/api/conversations/find-or-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ freelancerId: otherPartyId }),
      })
      if (res.ok) {
        const { conversationId: convId } = await res.json()
        setConversationId(convId)
      } else {
        setLoadingMsgs(false)
      }
    })
  }, [id, supabase, router])

  // ── Load messages ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!conversationId || !user) return
    setLoadingMsgs(true)
    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        const msgs = (data as Message[]) ?? []
        setMessages(msgs)
        setLoadingMsgs(false)

        const unreadIds = msgs
          .filter((m) => !m.is_read && m.sender_id !== user.id)
          .map((m) => m.id)
        if (unreadIds.length > 0) {
          supabase.from("messages").update({ is_read: true }).in("id", unreadIds).then(() => {})
        }
      })
  }, [conversationId, user, supabase])

  // ── Realtime subscription ────────────────────────────────────────────────────
  useEffect(() => {
    if (!conversationId) return
    const channel = supabase
      .channel(`order-conv-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as Message
          setMessages((prev) =>
            prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId, supabase])

  function dismissBanner() {
    localStorage.setItem(BANNER_KEY, "1")
    setBannerDismissed(true)
  }

  // ── Send message ─────────────────────────────────────────────────────────────
  async function sendMessage() {
    if (!newMessage.trim() || !user || !order || !conversationId || sending) return
    const content = newMessage.trim()
    setNewMessage("")
    setSending(true)

    const res = await fetch("/api/order-messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation_id: conversationId, content, order_id: order.id }),
    })

    if (res.ok) {
      const { message: data, wasFiltered, crossMessageDetected, maskedMessageIds } = await res.json()

      if (crossMessageDetected) {
        toast({ title: tm.crossDetectedTitle, duration: 5000 })
        if (maskedMessageIds?.length > 0) {
          setMessages((prev) =>
            prev.map((m) => maskedMessageIds.includes(m.id) ? { ...m, content: `[${tm.maskedContact}]` } : m)
          )
        }
      } else if (wasFiltered) {
        toast({
          title: tm.maskedContact,
          description: tm.maskedContactDesc,
          duration: 5000,
        })
      }

      if (data) {
        setMessages((prev) =>
          prev.some((m) => m.id === data.id) ? prev : [...prev, data as Message]
        )

        const recipientId = order.client_id === user.id ? order.freelancer_id : order.client_id
        const senderName =
          (user.user_metadata?.full_name as string | undefined) ??
          user.email?.split("@")[0] ??
          "Utilisateur"

        fetch("/api/emails/new-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipientId, senderName, messagePreview: data.content }),
        }).catch(() => {})
      }
    }

    setSending(false)
  }

  // ── Loading state ────────────────────────────────────────────────────────────
  if (order === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // ── Not found / not allowed ──────────────────────────────────────────────────
  if (order === null) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-24 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-xl font-bold mb-2 text-foreground">{t.notFound}</h1>
            <p className="text-sm text-muted-foreground mb-6">{t.notFoundSub}</p>
            <Button asChild variant="outline">
              <Link href="/commandes">
                <ArrowLeft className={cn("h-4 w-4", lang === "ar" && "rotate-180")} />
                {t.back}
              </Link>
            </Button>
          </div>
        </main>
      </>
    )
  }

  const senderProfileOf = (senderId: string) =>
    senderId === order.client_id ? clientProfile : freelancerProfile

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5">

          {/* Back */}
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ms-2 text-muted-foreground hover:text-foreground gap-1.5"
          >
            <Link href="/commandes">
              <ArrowLeft className={cn("h-4 w-4", lang === "ar" && "rotate-180")} />
              {t.back}
            </Link>
          </Button>

          {/* Order info card */}
          <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4 shadow-sm">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <h1 className="text-base sm:text-lg font-black text-foreground leading-snug">
                    {order.service_title}
                  </h1>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 shrink-0" />
                    <span>
                      {format(new Date(order.created_at), "d MMMM yyyy", { locale })}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span
                    className={cn(
                      "text-xs font-semibold px-2.5 py-1 rounded-full",
                      statusClasses[order.status] ?? "bg-muted text-muted-foreground"
                    )}
                  >
                    {t.statuses[order.status] ?? order.status}
                  </span>
                  <span className="text-base sm:text-lg font-black text-foreground">
                    {order.price.toLocaleString()} MAD
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
              <div>
                <p className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground mb-2">
                  {t.client}
                </p>
                {clientProfile ? (
                  <Link
                    href={`/profil/${clientProfile.id}`}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit"
                  >
                    <Avatar profile={clientProfile} size="md" />
                    <span className="text-sm font-semibold text-foreground truncate">
                      {clientProfile.full_name || "Client"}
                    </span>
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground mb-2">
                  {t.freelancer}
                </p>
                {freelancerProfile ? (
                  <Link
                    href={`/profil/${freelancerProfile.id}`}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit"
                  >
                    <Avatar profile={freelancerProfile} size="md" />
                    <span className="text-sm font-semibold text-foreground truncate">
                      {freelancerProfile.full_name || "Freelance"}
                    </span>
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </div>
            </div>
          </div>

          {/* Discussion section */}
          <div className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h2 className="font-bold text-foreground">{t.discussion}</h2>
            </div>

            {/* Trust banner */}
            {!bannerDismissed && (
              <div className="flex items-start gap-2 px-4 py-2.5 bg-muted/60 border-b border-border text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/70" />
                <span className="flex-1 leading-relaxed">{tm.trustBanner}</span>
                <button
                  onClick={dismissBanner}
                  className="shrink-0 rounded hover:text-foreground transition-colors p-0.5"
                  aria-label={tm.trustBannerClose}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Messages thread */}
            <div className="h-[280px] sm:h-[420px] overflow-y-auto p-4 space-y-0.5 bg-muted/10">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.noMessages}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.noMessagesSub}</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => {
                    const mine = msg.sender_id === user?.id
                    const prev = messages[i - 1]
                    const showTimestamp =
                      !prev ||
                      new Date(msg.created_at).getTime() -
                        new Date(prev.created_at).getTime() >
                        5 * 60_000
                    const showSender = !prev || prev.sender_id !== msg.sender_id
                    const senderProfile = senderProfileOf(msg.sender_id)

                    return (
                      <div key={msg.id}>
                        {showTimestamp && (
                          <div className="flex justify-center my-4">
                            <span className="text-[11px] text-muted-foreground bg-background border border-border px-3 py-1 rounded-full">
                              {format(new Date(msg.created_at), "d MMMM · HH:mm", { locale })}
                            </span>
                          </div>
                        )}

                        <div
                          className={cn(
                            "flex mb-1",
                            mine ? "justify-end" : "justify-start"
                          )}
                        >
                          {!mine && (
                            <div className="me-2 self-end mb-1 shrink-0">
                              {senderProfile ? (
                                <Avatar profile={senderProfile} size="sm" />
                              ) : (
                                <div className="h-7 w-7 rounded-full bg-muted" />
                              )}
                            </div>
                          )}

                          <div className="max-w-[75%] sm:max-w-[60%]">
                            {showSender && !mine && senderProfile?.full_name && (
                              <p className="text-[11px] text-muted-foreground ms-1 mb-0.5">
                                {senderProfile.full_name}
                              </p>
                            )}
                            <div
                              className={cn(
                                "px-4 py-2.5 rounded-2xl text-sm",
                                mine
                                  ? "bg-primary text-primary-foreground rounded-br-md rtl:rounded-br-2xl rtl:rounded-bl-md"
                                  : "bg-background border border-border text-foreground shadow-sm rounded-bl-md rtl:rounded-bl-2xl rtl:rounded-br-md"
                              )}
                            >
                              <p className="leading-relaxed whitespace-pre-wrap break-words">
                                {msg.content}
                              </p>
                              <p
                                className={cn(
                                  "text-[10px] mt-1 text-end",
                                  mine
                                    ? "text-primary-foreground/60"
                                    : "text-muted-foreground"
                                )}
                              >
                                {format(new Date(msg.created_at), "HH:mm")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input area */}
            <div className="p-3 sm:p-4 border-t border-border bg-background">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  sendMessage()
                }}
                className="flex items-end gap-2"
              >
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder={t.inputPlaceholder}
                  rows={1}
                  className={cn(
                    "flex-1 resize-none rounded-xl border border-border bg-muted/30 px-4 py-2.5",
                    "text-sm placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
                    "min-h-[42px] max-h-32 transition-all"
                  )}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newMessage.trim() || sending || !conversationId}
                  className="h-[42px] w-[42px] rounded-xl bg-primary hover:bg-primary/90 shrink-0"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className={cn("h-4 w-4", lang === "ar" && "rotate-180")} />
                  )}
                </Button>
              </form>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
