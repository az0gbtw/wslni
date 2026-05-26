"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { MessageCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ContactSellerButtonProps {
  freelancerId: string
  label: string
  variant?: "outline" | "default" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showIcon?: boolean
}

export function ContactSellerButton({
  freelancerId,
  label,
  variant = "outline",
  size = "default",
  className,
  showIcon = false,
}: ContactSellerButtonProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch("/api/conversations/find-or-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ freelancerId }),
      })

      if (res.status === 401) {
        router.push(`/connexion?redirect=${encodeURIComponent(pathname)}`)
        return
      }

      if (!res.ok) return

      const { conversationId } = await res.json()
      router.push(`/messages?conversation=${conversationId}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : showIcon ? (
        <MessageCircle className="h-4 w-4" />
      ) : null}
      {label}
    </Button>
  )
}
