import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import {
  getCategoryLabel, getGroupForCategory,
  CATEGORY_GROUPS, GROUP_GRADIENTS, GROUP_PILL_COLORS,
} from "@/lib/categories"
import { translations } from "@/lib/translations"
import { ServiceDetailClient, type PortfolioItem } from "@/components/service-detail-client"

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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: service, error: metaError } = await supabase
    .from("services")
    .select("title, description")
    .eq("id", id)
    .single()
  if (metaError) console.error("[service-detail] metadata:", metaError.message)
  if (!service) return { title: "Service | Wslni.ma" }
  return {
    title: `${service.title} | Wslni.ma`,
    description: (service.description as string | null)?.slice(0, 155) ?? undefined,
  }
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

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single()

  if (serviceError) console.error("[service-detail] service:", serviceError.message)
  if (!service) return <div className="p-10 text-center text-muted-foreground">Service introuvable.</div>

  const [
    { data: profile, error: profileError },
    { data: reviewsData, error: reviewsError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url, job_title, cin_status, created_at")
      .eq("id", service.user_id)
      .single(),
    supabase
      .from("reviews")
      .select("rating")
      .eq("freelancer_id", service.user_id),
  ])

  if (profileError) console.error("[service-detail] profile:", profileError.message)
  if (reviewsError) console.error("[service-detail] reviews:", reviewsError.message)

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
  const portfolioItems: PortfolioItem[] = Array.isArray(service.portfolio_items)
    ? (service.portfolio_items as PortfolioItem[])
    : []

  const groupValue = service.category_group ?? getGroupForCategory(service.category) ?? ""
  const gradient   = GROUP_GRADIENTS[groupValue] ?? { bg: "from-gray-50 to-gray-100", icon: "text-gray-400" }
  const pillColor  = GROUP_PILL_COLORS[groupValue] ?? { pill: "bg-gray-100 text-gray-700 border-gray-200" }
  const categoryLabel = getCategoryLabel(service.category, lang)
  const ini = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?"

  return (
    <div className="page-enter">
      <Navbar />
      <ServiceDetailClient
        service={{
          id: service.id,
          title: service.title,
          description: service.description,
          category: service.category,
          price: service.price,
          delivery_days: service.delivery_days,
          user_id: service.user_id,
        }}
        profile={profile}
        avgRating={avgRating}
        reviewCount={reviewCount}
        lang={lang}
        coverImage={coverImage}
        extraImages={extraImages}
        requirements={requirements}
        tiers={tiers}
        groupValue={groupValue}
        gradient={gradient}
        pillColor={pillColor}
        categoryLabel={categoryLabel}
        ini={ini}
        portfolioItems={portfolioItems}
      />
    </div>
  )
}
