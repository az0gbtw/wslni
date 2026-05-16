import { cookies } from "next/headers"
import Link from "next/link"
import {
  ArrowLeft, Clock, CheckCircle2, Star, MessageCircle,
  Palette, Code2, TrendingUp, Video, PenTool, Music,
  Briefcase, GraduationCap, Sparkles, ShieldCheck,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import {
  getCategoryLabel, getGroupForCategory,
  CATEGORY_GROUPS, GROUP_GRADIENTS, GROUP_PILL_COLORS,
} from "@/lib/categories"
import { translations } from "@/lib/translations"
import { formatPrice } from "@/lib/utils"
import { TierSelector } from "@/components/tier-selector"

const GROUP_ICONS = [
  Palette, Code2, TrendingUp, Video, PenTool,
  Music, Briefcase, GraduationCap, Sparkles,
]

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

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const cookieStore = await cookies()
  const lang = (cookieStore.get("lang")?.value === "ar" ? "ar" : "fr") as "fr" | "ar"
  const t = translations[lang].serviceDetail

  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single()

  if (!service) return <div className="p-10 text-center text-muted-foreground">Service introuvable.</div>

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, job_title")
    .eq("id", service.user_id)
    .single()

  // Fetch review stats for the freelancer
  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("rating")
    .eq("freelancer_id", profile?.id ?? "")

  const reviewCount = reviewsData?.length ?? 0
  const avgRating =
    reviewCount > 0
      ? reviewsData!.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewCount
      : null

  const images: string[] = Array.isArray(service.images) ? service.images : []
  const coverImage = images[0] ?? null
  const extraImages = images.slice(1, 5)
  const requirements: string[] = Array.isArray(service.requirements)
    ? service.requirements.filter(Boolean)
    : []
  const tiers = service.pricing_tiers as PricingTiers | null

  const groupValue = service.category_group ?? getGroupForCategory(service.category) ?? ""
  const groupIdx   = CATEGORY_GROUPS.findIndex((g) => g.value === groupValue)
  const GroupIcon  = GROUP_ICONS[groupIdx] ?? Palette
  const gradient   = GROUP_GRADIENTS[groupValue] ?? { bg: "from-gray-50 to-gray-100", icon: "text-gray-400" }
  const pillColor  = GROUP_PILL_COLORS[groupValue] ?? { pill: "bg-gray-100 text-gray-700 border-gray-200" }
  const categoryLabel = getCategoryLabel(service.category, lang)

  const ini = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?"

  return (
    <>
      <Navbar />

      {/* ── Cover ── */}
      <div className="relative w-full aspect-video max-h-[500px] overflow-hidden bg-muted">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
            alt={service.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient.bg} flex items-center justify-center`}>
            <GroupIcon className={`h-28 w-28 opacity-20 ${gradient.icon}`} />
          </div>
        )}

        {extraImages.length > 0 && (
          <div className="absolute bottom-4 start-4 flex gap-2">
            {extraImages.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt=""
                className="h-14 w-20 object-cover rounded-lg border-2 border-white/80 shadow-md"
              />
            ))}
          </div>
        )}
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Back link */}
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className={lang === "ar" ? "h-4 w-4 rotate-180" : "h-4 w-4"} />
          {t.backToServices}
        </Link>

        {/* ── Category + Title ── */}
        <div className="mb-6">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border mb-3 ${pillColor.pill}`}>
            {categoryLabel}
          </span>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-foreground leading-snug">
            {service.title}
          </h1>
        </div>

        {/* ── Freelancer card ── */}
        <div className="rounded-2xl border border-border bg-card p-4 mb-8 flex items-center gap-4 flex-wrap">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.full_name ?? "Freelance"}
              className="h-14 w-14 rounded-full object-cover shrink-0 ring-2 ring-border"
            />
          ) : (
            <div className="h-14 w-14 rounded-full bg-primary/10 ring-2 ring-border flex items-center justify-center shrink-0">
              <span className="text-lg font-black text-primary">{ini}</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-foreground leading-tight">
              {profile?.full_name ?? "Freelance"}
            </p>
            {profile?.job_title && (
              <p className="text-sm text-muted-foreground mt-0.5">{profile.job_title}</p>
            )}
            <div className="flex items-center gap-2 mt-1.5">
              {avgRating !== null ? (
                <>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`h-3.5 w-3.5 ${
                          n <= Math.round(avgRating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted-foreground/10 text-muted-foreground/25"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {avgRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({t.sellerReviews(reviewCount)})
                  </span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">{t.newSeller}</span>
              )}
            </div>
          </div>

          {profile?.id && (
            <Link
              href={`/profil/${profile.id}`}
              className="shrink-0 text-sm font-semibold text-primary hover:underline underline-offset-4 flex items-center gap-1"
            >
              {t.viewProfile}
              <ArrowLeft className={`h-3.5 w-3.5 ${lang === "ar" ? "" : "rotate-180"}`} />
            </Link>
          )}
        </div>

        {/* ── Pricing tiers ── */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-foreground mb-4">{t.chooseOffer}</h2>

          {tiers ? (
            <TierSelector tiers={tiers} serviceId={service.id} lang={lang} />
          ) : (
            /* Single price fallback */
            <div className="rounded-2xl border-2 border-primary bg-card p-6 shadow-lg shadow-primary/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t.from}</p>
                <p className="text-3xl font-black text-foreground">
                  {formatPrice(service.price, lang)}
                  <span className="text-base font-semibold text-muted-foreground ms-1">MAD</span>
                </p>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
                  <Clock className="h-4 w-4" />
                  <span>{t.delivery(service.delivery_days)}</span>
                </div>
              </div>
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl px-8 shrink-0">
                <Link href={`/commande/${service.id}`}>{t.orderService}</Link>
              </Button>
            </div>
          )}
        </div>

        {/* ── Description ── */}
        <div className="rounded-2xl border border-border bg-card p-6 mb-6">
          <h2 className="text-base font-bold text-foreground mb-3">{t.description}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {service.description}
          </p>
        </div>

        {/* ── Requirements ── */}
        {requirements.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-6 mb-6">
            <h2 className="text-base font-bold text-foreground mb-3">{t.requirements}</h2>
            <ul className="space-y-2.5">
              {requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Security note + Contact CTA ── */}
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">{t.securePayment}</p>
          </div>
          <Button
            asChild
            variant="outline"
            className="shrink-0 rounded-xl font-semibold border-primary text-primary hover:bg-primary/5"
          >
            <Link href="/messages" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              {t.contactSeller}
            </Link>
          </Button>
        </div>
      </div>
    </>
  )
}

