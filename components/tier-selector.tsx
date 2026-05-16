"use client"

import { useState } from "react"
import Link from "next/link"
import { Clock, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { translations, type Lang } from "@/lib/translations"

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

const TIER_STYLES = {
  basic: {
    idle: "border-slate-200 hover:border-slate-400",
    active: "border-slate-500 ring-2 ring-slate-200 shadow-md",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
  },
  standard: {
    idle: "border-primary/40 hover:border-primary",
    active: "border-primary ring-2 ring-primary/25 shadow-lg shadow-primary/10",
    badge: "bg-primary/10 text-primary border-primary/30",
  },
  premium: {
    idle: "border-amber-200 hover:border-amber-400",
    active: "border-amber-400 ring-2 ring-amber-200 shadow-md",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
}

export function TierSelector({
  tiers,
  serviceId,
  lang,
}: {
  tiers: PricingTiers
  serviceId: string
  lang: Lang
}) {
  const t = translations[lang].serviceDetail

  const defaultKey: "basic" | "standard" | "premium" = tiers.standard ? "standard" : "basic"
  const [selected, setSelected] = useState<"basic" | "standard" | "premium">(defaultKey)

  const selectedTier = tiers[selected]
  const orderHref = `/commande/${serviceId}?tier=${selected}&price=${encodeURIComponent(selectedTier.price)}&delivery_days=${encodeURIComponent(selectedTier.delivery_days)}`

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {(["basic", "standard", "premium"] as const).map((key) => {
          const tier = tiers[key]
          const styles = TIER_STYLES[key]
          const isSelected = selected === key
          const isPopular = key === "standard"
          const days = Number(tier.delivery_days)

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              className={`relative rounded-2xl border-2 bg-card p-5 flex flex-col gap-3 text-start transition-all cursor-pointer w-full ${
                isSelected ? styles.active : styles.idle
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 start-1/2 -translate-x-1/2 rtl:translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                    {t.popular}
                  </span>
                </div>
              )}

              {isSelected && (
                <div className="absolute top-3 end-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pe-6">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles.badge}`}>
                  {tier.name || t.tierLabels[key]}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>{t.delivery(days)}</span>
                </div>
              </div>

              {tier.description && (
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {tier.description}
                </p>
              )}

              <div className="pt-2 border-t border-border">
                <p className="text-2xl font-black text-foreground">
                  {formatPrice(Number(tier.price), lang)}{" "}
                  <span className="text-sm font-semibold text-muted-foreground">MAD</span>
                </p>
              </div>
            </button>
          )
        })}
      </div>

      <Button
        asChild
        size="lg"
        className="w-full font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <Link href={orderHref}>
          {t.orderService} — {formatPrice(Number(selectedTier.price), lang)} MAD
        </Link>
      </Button>
    </div>
  )
}
