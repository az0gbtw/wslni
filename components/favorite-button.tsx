"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface FavoriteButtonProps {
  serviceId: string
  isFavorited: boolean
  userId: string | null
  onToggle: (serviceId: string, newState: boolean) => void
  className?: string
}

export function FavoriteButton({ serviceId, isFavorited, userId, onToggle, className = "" }: FavoriteButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [animating, setAnimating] = useState(false)

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!userId) {
      router.push("/connexion")
      return
    }

    setAnimating(true)
    onToggle(serviceId, !isFavorited)

    const supabase = createClient()
    if (isFavorited) {
      await supabase.from("favorites").delete().eq("user_id", userId).eq("service_id", serviceId)
      toast({ title: "Service retiré de vos favoris", duration: 2500 })
    } else {
      await supabase.from("favorites").insert({ user_id: userId, service_id: serviceId })
      toast({ title: "Service ajouté à vos favoris", duration: 2500 })
    }
  }

  return (
    <button
      onClick={handleClick}
      aria-label={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={`flex items-center justify-center w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all duration-150 hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
    >
      <Heart
        className={`h-4 w-4 transition-colors ${
          isFavorited ? "fill-red-500 text-red-500" : "fill-none text-muted-foreground"
        }${animating ? " animate-heartBeat" : ""}`}
        onAnimationEnd={() => setAnimating(false)}
      />
    </button>
  )
}
