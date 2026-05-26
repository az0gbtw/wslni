"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft, Clock, CheckCircle2, Star, ShieldCheck,
  Lock, ThumbsUp, MessageCircle, X, Download, ZoomIn,
  FileText as DocIcon,
  Palette, Code2, TrendingUp, Video, PenTool, Music, Briefcase, GraduationCap, Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContactSellerButton } from "@/components/contact-seller-button"
import { formatPrice } from "@/lib/utils"
import { translations, type Lang } from "@/lib/translations"
import { CATEGORY_GROUPS } from "@/lib/categories"

const GROUP_ICONS = [Palette, Code2, TrendingUp, Video, PenTool, Music, Briefcase, GraduationCap, Sparkles]
const TIER_KEYS = ["basic", "standard", "premium"] as const
type TierKey = typeof TIER_KEYS[number]

interface PricingTier {
  name: string
  description: string
  price: string
  delivery_days: string
}
interface PricingTiers {
  basic: PricingTier
  standard: PricingTier
  premium: PricingTier
}

export interface PortfolioItem {
  url: string
  title?: string
  type: "image" | "pdf" | "video" | "audio"
}

export interface ServiceDetailClientProps {
  service: {
    id: string
    title: string
    description: string
    category: string
    price: number
    delivery_days: number
    user_id: string
  }
  profile: {
    id: string
    full_name: string | null
    avatar_url: string | null
    job_title: string | null
    cin_status?: string | null
    created_at?: string | null
  } | null
  avgRating: number | null
  reviewCount: number
  lang: Lang
  coverImage: string | null
  extraImages: string[]
  requirements: string[]
  tiers: PricingTiers | null
  groupValue: string
  gradient: { bg: string; icon: string }
  pillColor: { pill: string }
  categoryLabel: string
  ini: string
  portfolioItems: PortfolioItem[]
}

function StarRow({ rating }: { rating: number }) {
  const rounded = Math.round(rating)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${
            n <= rounded ? "fill-amber-400 text-amber-400" : "fill-muted-foreground/10 text-muted-foreground/25"
          }`}
        />
      ))}
    </div>
  )
}

const TRUST_ITEMS = [
  { Icon: Lock, label: "Paiement sécurisé" },
  { Icon: ThumbsUp, label: "Satisfaction garantie" },
  { Icon: MessageCircle, label: "Support inclus" },
]

export function ServiceDetailClient({
  service, profile, avgRating, reviewCount, lang,
  coverImage, extraImages, requirements, tiers,
  groupValue, gradient, pillColor, categoryLabel, ini,
  portfolioItems,
}: ServiceDetailClientProps) {
  const t = translations[lang].serviceDetail

  const defaultTier: TierKey = tiers?.standard ? "standard" : "basic"
  const [selectedTier, setSelectedTier] = useState<TierKey>(defaultTier)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  const currentTier = tiers ? tiers[selectedTier] : null
  const displayPrice = currentTier ? Number(currentTier.price) : service.price
  const displayDelivery = currentTier ? Number(currentTier.delivery_days) : service.delivery_days
  const orderHref = tiers && currentTier
    ? `/commande/${service.id}?tier=${selectedTier}&price=${encodeURIComponent(currentTier.price)}&delivery_days=${encodeURIComponent(currentTier.delivery_days)}`
    : `/commande/${service.id}`

  const groupIdx = CATEGORY_GROUPS.findIndex((g) => g.value === groupValue)
  const GroupIcon = GROUP_ICONS[groupIdx] ?? Palette

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : null

  return (
    <>
      {/* ── Hero ── */}
      <div className="relative w-full h-[380px] sm:h-[460px] overflow-hidden">
        {/* Red gradient — always the base, acts as fallback when no image */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-800 to-red-600" />

        {/* Cover image sits above the gradient; loading/error just reveals gradient */}
        {coverImage && (
          <Image
            src={coverImage}
            alt={service.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        )}

        {/* Dark overlay — always on top of the image for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5" />

        {/* Overlaid text */}
        <div className="absolute inset-0 flex flex-col justify-end px-5 pb-7 sm:px-10 sm:pb-9">
          <div className="mx-auto w-full max-w-6xl">
            {/* Category + delivery */}
            <div className="flex items-center gap-3 mb-3">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border ${pillColor.pill}`}>
                {categoryLabel}
              </span>
              <span className="flex items-center gap-1.5 text-white/80 text-sm">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                {t.delivery(displayDelivery)}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-5 max-w-3xl drop-shadow-md">
              {service.title}
            </h1>

            {/* Freelancer row */}
            {profile && (
              <div className="flex items-center gap-3">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name ?? "Freelance"}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-white/40 shrink-0"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-full bg-white/20 flex items-center justify-center shrink-0 ring-2 ring-white/30">
                    <span className="text-xs font-bold text-white">{ini}</span>
                  </div>
                )}
                <div>
                  <p className="text-white font-semibold text-sm flex items-center gap-1.5">
                    {profile.full_name ?? "Freelance"}
                    {profile.cin_status === "verified" && (
                      <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                    )}
                  </p>
                  {profile.job_title && (
                    <p className="text-white/70 text-xs mt-0.5">{profile.job_title}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Page content ── */}
      <div className="mx-auto max-w-6xl px-4 py-8">

        {/* Back link */}
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-7"
        >
          <ArrowLeft className={lang === "ar" ? "h-4 w-4 rotate-180" : "h-4 w-4"} />
          {t.backToServices}
        </Link>

        <div className="lg:flex lg:gap-10 lg:items-start">

          {/* ── Left column ── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Extra images gallery */}
            {extraImages.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
                {extraImages.map((url, i) => (
                  <Image
                    key={i}
                    src={url}
                    alt=""
                    width={180}
                    height={110}
                    className="object-cover rounded-xl border border-border/40 shrink-0 shadow-sm"
                  />
                ))}
              </div>
            )}

            {/* Description */}
            <div className="bg-card rounded-2xl shadow-md p-8">
              <h2 className="text-lg font-bold text-foreground mb-4">{t.description}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {service.description}
              </p>
            </div>

            {/* Package selector */}
            {tiers && (
              <div className="bg-card rounded-2xl shadow-md p-8">
                <h2 className="text-lg font-bold text-foreground mb-5">{t.chooseOffer}</h2>

                {/* Toggle tabs */}
                <div className="flex rounded-xl bg-muted/60 border border-border/50 p-1 mb-6 gap-1">
                  {TIER_KEYS.map((key) => {
                    const tier = tiers[key]
                    const isActive = selectedTier === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedTier(key)}
                        className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {tier.name || t.tierLabels[key]}
                      </button>
                    )
                  })}
                </div>

                {/* Selected tier detail */}
                {(() => {
                  const tier = tiers[selectedTier]
                  const days = Number(tier.delivery_days)
                  return (
                    <div className="rounded-xl border-2 border-primary bg-primary/5 p-6 transition-all duration-200">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <p className="text-3xl font-black text-foreground">
                            {formatPrice(Number(tier.price), lang)}
                            <span className="text-base font-semibold text-muted-foreground ms-1.5">MAD</span>
                          </p>
                        </div>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-full px-3 py-1.5 shrink-0 border border-border/60">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          {t.delivery(days)}
                        </span>
                      </div>
                      {tier.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {tier.description}
                        </p>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}

            {/* Requirements */}
            {requirements.length > 0 && (
              <div className="rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-8">
                <h2 className="text-lg font-bold text-foreground mb-4">{t.requirements}</h2>
                <ul className="space-y-3">
                  {requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Exemples de travaux */}
            {portfolioItems.length > 0 && (
              <div className="bg-card rounded-2xl shadow-md p-8">
                <h2 className="text-lg font-bold text-foreground mb-5">Exemples de travaux</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {portfolioItems.map((item, i) =>
                    item.type === "pdf" ? (
                      <a
                        key={i}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-muted/40 p-4 hover:bg-muted/60 transition-colors group"
                      >
                        <DocIcon className="h-10 w-10 text-red-500 group-hover:scale-110 transition-transform" />
                        <span className="text-xs text-center text-muted-foreground line-clamp-2 leading-snug">
                          {item.title || "Document PDF"}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-medium text-primary">
                          <Download className="h-3 w-3" />
                          Télécharger
                        </span>
                      </a>
                    ) : item.type === "video" ? (
                      <div key={i} className="rounded-xl overflow-hidden border border-border/60 bg-black aspect-square flex items-center justify-center">
                        <video src={item.url} controls className="w-full h-full" />
                      </div>
                    ) : item.type === "audio" ? (
                      <div key={i} className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-purple-50 p-4">
                        <Music className="h-10 w-10 text-purple-500" />
                        {item.title && (
                          <span className="text-xs text-center text-muted-foreground line-clamp-2 leading-snug">{item.title}</span>
                        )}
                        <audio src={item.url} controls className="w-full" />
                      </div>
                    ) : (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setLightboxUrl(item.url)}
                        className="relative aspect-square rounded-xl overflow-hidden border border-border/60 group cursor-zoom-in"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={item.title || ""}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Freelancer mini card */}
            {profile && (
              <div className="bg-card rounded-2xl shadow-md p-7">
                <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-5">
                  À propos du vendeur
                </p>
                <div className="flex items-start gap-4">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.full_name ?? "Freelance"}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-full object-cover shrink-0 ring-2 ring-border"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0 ring-2 ring-border">
                      <span className="text-xl font-black text-primary">{ini}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-foreground flex items-center gap-1.5">
                      {profile.full_name ?? "Freelance"}
                      {profile.cin_status === "verified" && (
                        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                      )}
                    </p>
                    {profile.job_title && (
                      <p className="text-sm text-muted-foreground mt-0.5">{profile.job_title}</p>
                    )}
                    <div className="flex items-center gap-2.5 mt-2">
                      {avgRating !== null ? (
                        <>
                          <StarRow rating={avgRating} />
                          <span className="text-sm font-semibold text-foreground">{avgRating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">
                            ({t.sellerReviews(reviewCount)})
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">{t.newSeller}</span>
                      )}
                    </div>
                    {memberSince && (
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Membre depuis {memberSince}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-6 pt-5 border-t border-border/60">
                  <Button asChild variant="outline" className="w-full font-semibold rounded-xl">
                    <Link href={`/profil/${profile.id}`}>
                      {t.viewProfile}
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <div className="mt-8 lg:mt-0 lg:w-[340px] lg:shrink-0 lg:sticky lg:top-24 self-start">
            <div className="rounded-2xl shadow-lg border border-border/40 p-6 bg-card">

              {/* Price */}
              <div className="mb-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{t.from}</p>
                <p className="text-4xl font-black text-foreground mt-1 leading-none">
                  {formatPrice(displayPrice, lang)}
                  <span className="text-lg font-semibold text-muted-foreground ms-1.5">MAD</span>
                </p>
              </div>

              {/* Delivery */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 mt-3">
                <Clock className="h-4 w-4 shrink-0" />
                <span>{t.delivery(displayDelivery)}</span>
              </div>

              {/* Order button */}
              <Button
                asChild
                size="lg"
                className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md shadow-primary/20 mb-3"
              >
                <Link href={orderHref}>{t.orderService}</Link>
              </Button>

              {/* Contact button */}
              {profile?.id && (
                <ContactSellerButton
                  freelancerId={profile.id}
                  label={t.contactSeller}
                  variant="outline"
                  className="w-full rounded-xl font-semibold"
                  showIcon
                />
              )}

              {/* Trust badges */}
              <div className="mt-6 pt-5 border-t border-border/60 space-y-3">
                {TRUST_ITEMS.map(({ Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Icon className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxUrl}
            alt=""
            className="max-w-full max-h-full rounded-xl shadow-2xl object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
