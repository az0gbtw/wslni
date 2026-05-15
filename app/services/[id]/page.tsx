import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Clock, Star, ImageIcon, CheckCircle2,
  Palette, Code2, TrendingUp, Video, PenTool, Music,
  Briefcase, GraduationCap, Sparkles,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import {
  getCategoryLabel, getGroupForCategory,
  CATEGORY_GROUPS, GROUP_GRADIENTS,
} from "@/lib/categories"

/* ─── Icon map ──────────────────────────────────────────────── */
const GROUP_ICONS = [
  Palette, Code2, TrendingUp, Video, PenTool,
  Music, Briefcase, GraduationCap, Sparkles,
]

/* ─── Types ─────────────────────────────────────────────────── */
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

/* ─── Page ──────────────────────────────────────────────────── */
export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: service } = await supabase
    .from("services")
    .select("*, profiles(id, full_name, avatar_url, job_title)")
    .eq("id", id)
    .eq("status", "published")
    .single()

  if (!service) notFound()

  const images: string[]      = Array.isArray(service.images) ? service.images : []
  const coverImage            = images[0] ?? null
  const requirements: string[] = Array.isArray(service.requirements) ? service.requirements.filter(Boolean) : []
  const tiers                 = service.pricing_tiers as PricingTiers | null

  const groupValue = service.category_group ?? getGroupForCategory(service.category) ?? ""
  const groupIdx   = CATEGORY_GROUPS.findIndex((g) => g.value === groupValue)
  const GroupIcon  = GROUP_ICONS[groupIdx] ?? Palette
  const gradient   = GROUP_GRADIENTS[groupValue] ?? { bg: "from-gray-50 to-gray-100", icon: "text-gray-400" }
  const categoryLabel = getCategoryLabel(service.category)

  const profile = service.profiles as {
    id: string
    full_name: string | null
    avatar_url: string | null
    job_title: string | null
  } | null

  const ini = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?"

  const tierMeta = {
    basic:    { badge: "bg-slate-100 text-slate-700 border-slate-200", label: "Basique"  },
    standard: { badge: "bg-red-50 text-red-700 border-red-200",        label: "Standard" },
    premium:  { badge: "bg-amber-50 text-amber-700 border-amber-200",  label: "Premium"  },
  }

  return (
    <>
      <Navbar />

      {/* ── Cover image / placeholder ── */}
      <div className="relative w-full aspect-video max-h-[520px] overflow-hidden bg-muted">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
            alt={service.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient.bg} flex items-center justify-center`}>
            <GroupIcon className={`h-24 w-24 opacity-30 ${gradient.icon}`} />
          </div>
        )}

        {/* Additional images strip */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-4 flex gap-2">
            {images.slice(1, 5).map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt=""
                className="h-14 w-20 object-cover rounded-lg border-2 border-white/80 shadow"
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Back link */}
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux services
        </Link>

        <div className="grid lg:grid-cols-3 gap-8 items-start">

          {/* ── Left: main content ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Category + title */}
            <div>
              <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-3">
                {categoryLabel}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-snug mb-4">
                {service.title}
              </h1>

              {/* Freelancer mini-card */}
              <div className="flex items-center gap-3">
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name ?? "Freelance"}
                    className="h-10 w-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{ini}</span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">{profile?.full_name ?? "Freelance"}</p>
                  {profile?.job_title && (
                    <p className="text-xs text-muted-foreground">{profile.job_title}</p>
                  )}
                </div>
                {profile?.id && (
                  <Link
                    href={`/profil/${profile.id}`}
                    className="ms-auto text-xs text-primary hover:underline underline-offset-4"
                  >
                    Voir le profil
                  </Link>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-semibold text-foreground mb-3">Description du service</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {service.description}
              </p>
            </div>

            {/* Requirements */}
            {requirements.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-semibold text-foreground mb-3">Ce dont j&apos;ai besoin de vous</h2>
                <ul className="space-y-2">
                  {requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── Right: pricing sidebar ── */}
          <div className="space-y-4 lg:sticky lg:top-24">

            {tiers ? (
              <>
                {(["basic", "standard", "premium"] as const).map((key) => {
                  const tier = tiers[key]
                  const meta = tierMeta[key]
                  return (
                    <div
                      key={key}
                      className={`rounded-2xl border-2 ${meta.badge.split(" ").find(c => c.startsWith("border")) ?? "border-gray-200"} bg-card p-5 space-y-3`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${meta.badge}`}>
                          {tier.name || meta.label}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{tier.delivery_days} jour{Number(tier.delivery_days) > 1 ? "s" : ""}</span>
                        </div>
                      </div>

                      {tier.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">{tier.description}</p>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xl font-black text-foreground">{tier.price} <span className="text-sm font-semibold text-muted-foreground">DH</span></span>
                        <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl">
                          <Link href={`/paiement/${service.id}`}>Commander</Link>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </>
            ) : (
              /* Fallback if no pricing_tiers stored */
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">À partir de</p>
                  <p className="text-3xl font-black text-foreground">
                    {service.price.toLocaleString("fr-MA")}
                    <span className="text-base font-semibold text-muted-foreground ms-1">MAD</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground border-t border-border pt-3">
                  <Clock className="h-4 w-4" />
                  <span>Livraison en {service.delivery_days} jour{service.delivery_days > 1 ? "s" : ""}</span>
                </div>
                <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl">
                  <Link href={`/paiement/${service.id}`}>Commander ce service</Link>
                </Button>
              </div>
            )}

            {/* Trust badge */}
            <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-100 p-3.5 text-xs text-emerald-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>Paiement sécurisé · Satisfaction garantie</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
