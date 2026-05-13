import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { CategoriesSection } from "@/components/categories-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { FeaturedFreelancersSection } from "@/components/featured-freelancers-section"
import { TrustBannerSection } from "@/components/trust-banner-section"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()

  const [
    { count: freelancerCount },
    { count: serviceCount },
    { data: rawProfiles },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("services").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id, full_name, job_title, avatar_url")
      .not("full_name", "is", null)
      .not("job_title", "is", null)
      .order("created_at", { ascending: false })
      .limit(4),
  ])

  // Fetch the cheapest service price per featured profile in one query
  let profileServices: { user_id: string; price: number }[] = []
  const profileIds = rawProfiles?.map((p) => p.id) ?? []
  if (profileIds.length > 0) {
    const { data } = await supabase
      .from("services")
      .select("user_id, price")
      .in("user_id", profileIds)
    profileServices = data ?? []
  }

  const minPriceMap: Record<string, number> = {}
  for (const s of profileServices) {
    if (minPriceMap[s.user_id] == null || s.price < minPriceMap[s.user_id]) {
      minPriceMap[s.user_id] = s.price
    }
  }

  const featuredProfiles = (rawProfiles ?? []).map((p) => ({
    id: p.id as string,
    full_name: p.full_name as string,
    job_title: p.job_title as string,
    avatar_url: (p.avatar_url as string | null) ?? null,
    min_price: minPriceMap[p.id] ?? null,
  }))

  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection freelancerCount={freelancerCount ?? 0} serviceCount={serviceCount ?? 0} />
      <CategoriesSection />
      <HowItWorksSection />
      <FeaturedFreelancersSection profiles={featuredProfiles} />
      <TrustBannerSection freelancerCount={freelancerCount ?? 0} serviceCount={serviceCount ?? 0} />
      <Footer />
    </main>
  )
}
