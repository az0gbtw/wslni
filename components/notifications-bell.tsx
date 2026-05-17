"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { ReactNode } from "react"
import {
  Bell, MessageSquare, ShoppingBag, CheckCircle2, Package, PackageCheck, RefreshCw, Star, Check,
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { fr as frLocale, ar as arLocale } from "date-fns/locale"
import type { User, RealtimeChannel } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type NotifType =
  | "new_order"
  | "order_accepted"
  | "order_delivered"
  | "order_completed"
  | "new_message"
  | "order_status"
  | "new_review"

interface Notification {
  id: string
  type: NotifType
  title: string
  body: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

const TYPE_ICONS: Record<NotifType, ReactNode> = {
  new_order:       <ShoppingBag className="h-4 w-4" />,
  order_accepted:  <CheckCircle2 className="h-4 w-4" />,
  order_delivered: <Package className="h-4 w-4" />,
  order_completed: <PackageCheck className="h-4 w-4" />,
  new_message:     <MessageSquare className="h-4 w-4" />,
  order_status:    <RefreshCw className="h-4 w-4" />,
  new_review:      <Star className="h-4 w-4" />,
}

const TYPE_COLORS: Record<NotifType, string> = {
  new_order:       "text-green-500",
  order_accepted:  "text-blue-500",
  order_delivered: "text-orange-500",
  order_completed: "text-emerald-500",
  new_message:     "text-indigo-500",
  order_status:    "text-amber-500",
  new_review:      "text-yellow-500",
}

export function NotificationsBell({ user }: { user: User }) {
  const { lang } = useLanguage()
  const t = translations[lang].notifications
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabaseRef = useRef(createClient())
  const channelRef = useRef<RealtimeChannel | null>(null)

  const fetchNotifications = useCallback(async () => {
    const { data } = await supabaseRef.current
      .from("notifications")
      .select("id, type, title, body, link, is_read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)
    if (data) {
      setNotifications(data as Notification[])
      setUnreadCount(data.filter((n) => !n.is_read).length)
    }
  }, [user.id])

  useEffect(() => {
    if (!user?.id) return

    let cancelled = false

    async function setup() {
      // Await removal of any previous channel before creating a new one —
      // guarantees only one channel instance exists at a time across remounts
      if (channelRef.current) {
        await supabaseRef.current.removeChannel(channelRef.current)
        channelRef.current = null
      }

      if (cancelled) return

      await fetchNotifications()

      if (cancelled) return

      const channel = supabaseRef.current
        .channel(`user-notifications:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          fetchNotifications
        )
        .subscribe()

      channelRef.current = channel
    }

    setup()

    return () => {
      cancelled = true
      if (channelRef.current) {
        supabaseRef.current.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [user.id, fetchNotifications])

  async function markAllRead() {
    await supabaseRef.current
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  async function markRead(id: string) {
    await supabaseRef.current.from("notifications").update({ is_read: true }).eq("id", id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
    setUnreadCount((c) => Math.max(0, c - 1))
  }

  const locale = lang === "ar" ? arLocale : frLocale

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label={t.title}
          className="relative flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card hover:bg-muted transition-all duration-150 hover:scale-[1.04] active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Bell className="h-4 w-4 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -end-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-80 p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold text-sm">{t.title}</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs text-primary hover:underline focus:outline-none"
            >
              <Check className="h-3 w-3" />
              {t.markAllRead}
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">{t.empty}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">{t.emptySub}</p>
            </div>
          ) : (
            notifications.map((n) => {
              const type = n.type as NotifType
              return (
                <Link
                  key={n.id}
                  href={n.link ?? "#"}
                  onClick={() => {
                    if (!n.is_read) markRead(n.id)
                    setOpen(false)
                  }}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${
                    !n.is_read ? "bg-primary/5" : ""
                  }`}
                >
                  <span className={`mt-0.5 shrink-0 ${TYPE_COLORS[type] ?? "text-muted-foreground"}`}>
                    {TYPE_ICONS[type] ?? <Bell className="h-4 w-4" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-1.5">
                      <p className={`text-sm leading-snug flex-1 ${
                        !n.is_read ? "font-semibold" : "font-medium text-muted-foreground"
                      }`}>
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    {n.body && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {n.body}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground/50 mt-1">
                      {formatDistanceToNow(new Date(n.created_at), {
                        addSuffix: true,
                        locale,
                      })}
                    </p>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
