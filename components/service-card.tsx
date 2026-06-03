"use client"

import Link from "next/link"
import Image from "next/image"
import {
  Clock, Star, ShieldCheck,
  Palette, Code2, TrendingUp, Video, PenTool, Music, Briefcase, GraduationCap, Sparkles,
} from "lucide-react"
import { CATEGORY_COLORS, getCategoryLabel, CATEGORY_GROUPS, getGroupForCategory, GROUP_GRADIENTS } from "@/lib/categories"
import { formatPrice } from "@/lib/utils"
import { ContactSellerButton } from "@/components/contact-seller-button"
import { FavoriteButton } from "@/components/favorite-button"
import { translations } from "@/lib/translations"

export interface ServiceWithProfile {
  id: string
  title: string
  description: string
  category: string
  category_group: string | null
  images: string[] | null
  price: number
  delivery_days: number
  created_at: string
  user_id: string
  avgRating: number | null
  reviewCount: number
  profiles: {
    id: string
    full_name: string | null
    avatar_url: string | null
    job_title: string | null
    city: string | null
    languages: string[] | null
    cin_status: string
  } | null
}

const GROUP_ICONS = [Palette, Code2, TrendingUp, Video, PenTool, Music, Briefcase, GraduationCap, Sparkles]

function StarDisplay({ rating }: { rating: number }) {
  const rounded = Math.round(rating)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3 w-3 ${
            n <= rounded ? "fill-amber-400 text-amber-400" : "fill-muted-foreground/10 text-muted-foreground/25"
          }`}
        />
      ))}
    </div>
  )
}

interface ServiceCardProps {
  service: ServiceWithProfile
  t: typeof translations["fr"]["services"]
  lang: "fr" | "ar"
  isFavorited: boolean
  userId: string | null
  onFavoriteToggle: (serviceId: string, newState: boolean) => void
}

export function ServiceCard({ service, t, lang, isFavorited, userId, onFavoriteToggle }: ServiceCardProps) {
  const profile = service.profiles
  const categoryColor = CATEGORY_COLORS[service.category] ?? "bg-gray-100 text-gray-700"
  const categoryLabel = getCategoryLabel(service.category, lang)
  const ini = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?"

  const coverImage = service.images?.[0] ?? null
  const groupValue = service.category_group ?? getGroupForCategory(service.category) ?? ""
  const groupIdx   = CATEGORY_GROUPS.findIndex((g) => g.value === groupValue)
  const GroupIcon  = GROUP_ICONS[groupIdx] ?? Palette
  const gradient   = GROUP_GRADIENTS[groupValue] ?? { bg: "from-gray-50 to-gray-100", icon: "text-gray-400" }

  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden animate-fadeIn">

      {/* Cover image with gradient overlay, category badge, and price */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <Link href={`/services/${service.id}`} className="block w-full h-full">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={service.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient.bg} flex items-center justify-center`}>
              <GroupIcon className={`h-12 w-12 opacity-40 ${gradient.icon}`} />
            </div>
          )}
          {/* Dark gradient for readability of overlaid elements */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent pointer-events-none" />
          {/* Category badge — bottom left */}
          <span className={`absolute bottom-2.5 start-3 rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryColor} shadow-sm z-10 pointer-events-none`}>
            {categoryLabel}
          </span>
          {/* Price — bottom right, large white bold */}
          <span className="absolute bottom-2 end-3 text-white font-bold text-lg leading-none drop-shadow-md z-10 pointer-events-none">
            {formatPrice(service.price, lang)}<span className="text-sm font-semibold ms-0.5"> MAD</span>
          </span>
        </Link>
        <FavoriteButton
          serviceId={service.id}
          isFavorited={isFavorited}
          userId={userId}
          onToggle={onFavoriteToggle}
          className="absolute top-2 end-2 z-10"
        />
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-5 gap-2.5">
        <Link href={`/services/${service.id}`}>
          <h2 className="text-base font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {service.title}
          </h2>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{service.description}</p>

        {service.avgRating !== null && (
          <div className="flex items-center gap-1.5">
            <StarDisplay rating={service.avgRating} />
            <span className="text-xs text-muted-foreground">
              {service.avgRating.toFixed(1)}
              <span className="ms-1">({service.reviewCount} {t.reviews})</span>
            </span>
          </div>
        )}
      </div>

      {/* Freelancer row — separator above */}
      <div className="border-t border-border/60 px-4 py-3 flex items-center gap-2 bg-muted/20">
        <Link
          href={`/profil/${service.user_id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity"
        >
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name ?? "Freelance"}
              width={28}
              height={28}
              className="rounded-full object-cover shrink-0 ring-1 ring-border"
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-primary">{ini}</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate flex items-center gap-1">
              {profile?.full_name ?? "Freelance"}
              {profile?.cin_status === "verified" && (
                <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
              )}
            </p>
            {profile?.job_title && <p className="text-xs text-muted-foreground truncate">{profile.job_title}</p>}
          </div>
        </Link>
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {service.delivery_days} {service.delivery_days > 1 ? t.days : t.day}
          </span>
          <ContactSellerButton
            freelancerId={service.user_id}
            label={t.contact}
            variant="default"
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 px-2.5 shrink-0"
          />
        </div>
      </div>
    </div>
  )
}
