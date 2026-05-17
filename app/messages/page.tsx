"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format, isToday, isYesterday } from "date-fns"
import { ar as arLocale, fr as frLocale } from "date-fns/locale"
import { Loader2, Send, Search, Plus, ArrowLeft, MessageSquare, X } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  job_title: string | null
}

interface Conversation {
  id: string
  participant1_id: string
  participant2_id: string
  last_message_at: string
  last_message_preview: string | null
  created_at: string
  otherParticipant: Profile
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string | null): string {
  if (!name) return "?"
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function UserAvatar({
  profile,
  size = "md",
}: {
  profile: Profile
  size?: "sm" | "md" | "lg"
}) {
  const cls = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  }[size]

  return (
    <div
      className={cn(
        "rounded-full bg-primary overflow-hidden flex items-center justify-center shrink-0 font-semibold text-white select-none",
        cls
      )}
    >
      {profile.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt={profile.full_name || ""}
          className="w-full h-full object-cover"
        />
      ) : (
        getInitials(profile.full_name)
      )}
    </div>
  )
}

function formatConvTime(dateStr: string, yesterday: string): string {
  const d = new Date(dateStr)
  if (isToday(d)) return format(d, "HH:mm")
  if (isYesterday(d)) return yesterday
  return format(d, "dd/MM")
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const tm = translations[lang].messages
  const supabase = useMemo(() => createClient(), [])
  const locale = lang === "ar" ? arLocale : frLocale

  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [convSearch, setConvSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [sending, setSending] = useState(false)
  const [showNewConv, setShowNewConv] = useState(false)
  const [userSearch, setUserSearch] = useState("")
  const [userResults, setUserResults] = useState<Profile[]>([])
  const [searchingUsers, setSearchingUsers] = useState(false)
  const [mobileView, setMobileView] = useState<"list" | "chat">("list")

  const activeConvIdRef = useRef<string | null>(null)
  const userIdRef = useRef<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { activeConvIdRef.current = activeConvId }, [activeConvId])
  useEffect(() => { userIdRef.current = user?.id ?? null }, [user])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  // ── Fetch conversations ─────────────────────────────────────────────────────
  const loadConversations = useCallback(
    async (uid: string) => {
      const { data: convs } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant1_id.eq.${uid},participant2_id.eq.${uid}`)
        .order("last_message_at", { ascending: false })

      if (!convs) return

      const otherIds = [
        ...new Set(
          convs.map((c) =>
            c.participant1_id === uid ? c.participant2_id : c.participant1_id
          )
        ),
      ]

      const { data: profiles } = otherIds.length
        ? await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, job_title")
            .in("id", otherIds)
        : { data: [] }

      const profileMap: Record<string, Profile> = {}
      for (const p of profiles ?? []) {
        profileMap[p.id] = p
      }

      const enriched: Conversation[] = convs.map((c) => {
        const otherId =
          c.participant1_id === uid ? c.participant2_id : c.participant1_id
        return {
          ...c,
          otherParticipant: profileMap[otherId] ?? {
            id: otherId,
            full_name: null,
            avatar_url: null,
            job_title: null,
          },
        }
      })

      setConversations(enriched)

      if (convs.length > 0) {
        const { data: unread } = await supabase
          .from("messages")
          .select("conversation_id")
          .eq("is_read", false)
          .neq("sender_id", uid)
          .in("conversation_id", convs.map((c) => c.id))

        const counts: Record<string, number> = {}
        for (const m of unread ?? []) {
          counts[m.conversation_id] = (counts[m.conversation_id] ?? 0) + 1
        }
        setUnreadCounts(counts)
      }
    },
    [supabase]
  )

  // ── Auth + initial load ─────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace("/connexion"); return }
      setUser(user)
      await loadConversations(user.id)
      setLoading(false)
    })
  }, [router, supabase, loadConversations])

  // ── Realtime ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel("msgs-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as Message
          const currentUserId = userIdRef.current
          const currentActiveId = activeConvIdRef.current

          setConversations((prev) =>
            prev
              .map((c) =>
                c.id === msg.conversation_id
                  ? { ...c, last_message_preview: msg.content, last_message_at: msg.created_at }
                  : c
              )
              .sort(
                (a, b) =>
                  new Date(b.last_message_at).getTime() -
                  new Date(a.last_message_at).getTime()
              )
          )

          if (msg.conversation_id === currentActiveId) {
            setMessages((prev) =>
              prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
            )
            if (msg.sender_id !== currentUserId) {
              supabase.from("messages").update({ is_read: true }).eq("id", msg.id).then(() => {})
            }
          } else if (msg.sender_id !== currentUserId) {
            setUnreadCounts((prev) => ({
              ...prev,
              [msg.conversation_id]: (prev[msg.conversation_id] ?? 0) + 1,
            }))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, supabase])

  // ── Load messages on conversation change ────────────────────────────────────
  useEffect(() => {
    if (!activeConvId || !user) return

    setLoadingMsgs(true)
    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", activeConvId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setMessages((data as Message[]) ?? [])
        setLoadingMsgs(false)

        const unreadIds = (data ?? [])
          .filter((m: Message) => !m.is_read && m.sender_id !== user.id)
          .map((m: Message) => m.id)

        if (unreadIds.length > 0) {
          supabase.from("messages").update({ is_read: true }).in("id", unreadIds).then(() => {})
        }
        setUnreadCounts((prev) => ({ ...prev, [activeConvId]: 0 }))
      })
  }, [activeConvId, user, supabase])

  // ── Send message ────────────────────────────────────────────────────────────
  async function sendMessage() {
    if (!newMessage.trim() || !activeConvId || !user || sending) return
    const content = newMessage.trim()
    setNewMessage("")
    setSending(true)

    const { data } = await supabase
      .from("messages")
      .insert({ conversation_id: activeConvId, sender_id: user.id, content })
      .select()
      .single()

    if (data) {
      setMessages((prev) =>
        prev.some((m) => m.id === data.id) ? prev : [...prev, data as Message]
      )

      const conv = conversations.find((c) => c.id === activeConvId)
      if (conv) {
        const recipientId =
          conv.participant1_id === user.id ? conv.participant2_id : conv.participant1_id
        fetch("/api/emails/new-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientId,
            senderName:
              (user.user_metadata?.full_name as string | undefined) ??
              user.email?.split("@")[0] ??
              tm.user,
            messagePreview: content,
          }),
        }).catch(() => {})
      }
    }
    setSending(false)
  }

  // ── User search ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userSearch.trim() || userSearch.length < 2) {
      setUserResults([])
      return
    }
    const timer = setTimeout(async () => {
      setSearchingUsers(true)
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, job_title")
        .ilike("full_name", `%${userSearch}%`)
        .neq("id", user?.id ?? "")
        .limit(10)
      setUserResults((data as Profile[]) ?? [])
      setSearchingUsers(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [userSearch, user?.id, supabase])

  // ── Start / open conversation ───────────────────────────────────────────────
  async function openConversationWith(other: Profile) {
    if (!user) return
    const [p1, p2] = [user.id, other.id].sort()

    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("participant1_id", p1)
      .eq("participant2_id", p2)
      .maybeSingle()

    let convId: string
    if (existing) {
      convId = existing.id
    } else {
      const { data: created } = await supabase
        .from("conversations")
        .insert({ participant1_id: p1, participant2_id: p2 })
        .select("id")
        .single()

      if (!created) return
      convId = created.id
      await loadConversations(user.id)
    }

    setActiveConvId(convId)
    setMobileView("chat")
    setShowNewConv(false)
    setUserSearch("")
    setUserResults([])
  }

  function closeNewConvDialog() {
    setShowNewConv(false)
    setUserSearch("")
    setUserResults([])
  }

  const activeConv = conversations.find((c) => c.id === activeConvId)

  const filteredConvs = convSearch
    ? conversations.filter((c) =>
        c.otherParticipant.full_name?.toLowerCase().includes(convSearch.toLowerCase())
      )
    : conversations

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <Navbar />

      <div className="fixed inset-x-0 bottom-0 top-16 flex overflow-hidden bg-background">

        {/* ── Conversation list ── */}
        <aside
          className={cn(
            "w-full md:w-80 lg:w-96 border-e border-border flex flex-col shrink-0 bg-background",
            mobileView === "chat" && "hidden md:flex"
          )}
        >
          <div className="p-4 border-b border-border space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-black text-foreground">{tm.header}</h1>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 rounded-lg"
                onClick={() => setShowNewConv(true)}
                title={tm.newConversation}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={tm.searchPlaceholder}
                className="ps-9 h-9 text-sm rounded-xl"
                value={convSearch}
                onChange={(e) => setConvSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/40">
            {filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-3">
                <MessageSquare className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground font-medium">
                  {convSearch ? tm.noConvFound : tm.noConversations}
                </p>
                {!convSearch && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1.5 mt-1"
                    onClick={() => setShowNewConv(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {tm.newConversation}
                  </Button>
                )}
              </div>
            ) : (
              filteredConvs.map((conv) => {
                const unread = unreadCounts[conv.id] ?? 0
                const isActive = conv.id === activeConvId

                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveConvId(conv.id)
                      setMobileView("chat")
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-muted/40",
                      isActive && "bg-primary/5 border-e-2 border-primary"
                    )}
                  >
                    <UserAvatar profile={conv.otherParticipant} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span
                          className={cn(
                            "text-sm truncate text-foreground",
                            unread > 0 ? "font-bold" : "font-semibold"
                          )}
                        >
                          {conv.otherParticipant.full_name || tm.user}
                        </span>
                        <span className="text-[11px] text-muted-foreground shrink-0">
                          {formatConvTime(conv.last_message_at, tm.yesterday)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={cn(
                            "text-xs truncate",
                            unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                          )}
                        >
                          {conv.last_message_preview || tm.newConversation}
                        </span>
                        {unread > 0 && (
                          <span className="shrink-0 min-w-[20px] h-5 px-1 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center">
                            {unread > 99 ? "99+" : unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* ── Chat panel ── */}
        <main
          className={cn(
            "flex-1 flex flex-col min-w-0",
            mobileView === "list" && "hidden md:flex"
          )}
        >
          {activeConv ? (
            <>
              {/* Chat header */}
              <div className="h-16 flex items-center gap-3 px-4 border-b border-border bg-background shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 md:hidden"
                  onClick={() => setMobileView("list")}
                >
                  <ArrowLeft className={cn("h-4 w-4", lang === "ar" && "rotate-180")} />
                </Button>
                <Link
                  href={`/profil/${activeConv.otherParticipant.id}`}
                  className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity"
                >
                  <UserAvatar profile={activeConv.otherParticipant} size="md" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {activeConv.otherParticipant.full_name || tm.user}
                    </p>
                    {activeConv.otherParticipant.job_title && (
                      <p className="text-xs text-muted-foreground truncate">
                        {activeConv.otherParticipant.job_title}
                      </p>
                    )}
                  </div>
                </Link>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-0.5 bg-muted/10">
                {loadingMsgs ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {tm.startChatWith}{" "}
                      <span className="font-semibold text-foreground">
                        {activeConv.otherParticipant.full_name || tm.user}
                      </span>
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => {
                      const isMe = msg.sender_id === user?.id
                      const prev = messages[i - 1]
                      const showTimestamp =
                        !prev ||
                        new Date(msg.created_at).getTime() -
                          new Date(prev.created_at).getTime() >
                          5 * 60_000

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
                              isMe ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[75%] sm:max-w-[60%] px-4 py-2.5 rounded-2xl text-sm",
                                isMe
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
                                  isMe ? "text-primary-foreground/60" : "text-muted-foreground"
                                )}
                              >
                                {format(new Date(msg.created_at), "HH:mm")}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message input */}
              <div className="p-3 sm:p-4 border-t border-border bg-background shrink-0">
                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage() }}
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
                    placeholder={tm.writePlaceholder}
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
                    disabled={!newMessage.trim() || sending}
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
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-5">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground mb-2">{tm.yourMessages}</h2>
                <p className="text-sm text-muted-foreground max-w-xs">{tm.yourMessagesSub}</p>
              </div>
              <Button
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                onClick={() => setShowNewConv(true)}
              >
                <Plus className="h-4 w-4" />
                {tm.newConversation}
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* ── New conversation dialog ── */}
      {showNewConv && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeNewConvDialog() }}
        >
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-black text-foreground">{tm.newConversation}</h2>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 rounded-lg"
                onClick={closeNewConvDialog}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="px-5 pt-4 pb-2">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder={tm.searchUserPlaceholder}
                  className="ps-9 rounded-xl"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="px-5 pb-5 max-h-72 overflow-y-auto space-y-1">
              {searchingUsers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : userResults.length > 0 ? (
                userResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => openConversationWith(u)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-start"
                  >
                    <UserAvatar profile={u} size="md" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {u.full_name || tm.user}
                      </p>
                      {u.job_title && (
                        <p className="text-xs text-muted-foreground truncate">{u.job_title}</p>
                      )}
                    </div>
                  </button>
                ))
              ) : userSearch.length >= 2 ? (
                <p className="text-center py-8 text-sm text-muted-foreground">
                  {tm.noUserFound(userSearch)}
                </p>
              ) : (
                <p className="text-center py-8 text-sm text-muted-foreground">
                  {tm.minCharsHint}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
