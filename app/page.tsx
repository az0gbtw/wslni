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
      .limit(20),
  ])

  // Fetch reviews for candidate profiles to compute avg rating
  const profileIds = rawProfiles?.map((p) => p.id) ?? []
  let reviews: { freelancer_id: string; rating: number }[] = []
  if (profileIds.length > 0) {
    const { data } = await supabase
      .from("reviews")
      .select("freelancer_id, rating")
      .in("freelancer_id", profileIds)
    reviews = data ?? []
  }

  // Compute avg rating and review count per profile
  const ratingMap: Record<string, { sum: number; count: number }> = {}
  for (const r of reviews) {
    if (!ratingMap[r.freelancer_id]) ratingMap[r.freelancer_id] = { sum: 0, count: 0 }
    ratingMap[r.freelancer_id].sum += r.rating
    ratingMap[r.freelancer_id].count += 1
  }

  const featuredProfiles = (rawProfiles ?? [])
    .map((p) => ({
      id: p.id as string,
      full_name: p.full_name as string,
      job_title: p.job_title as string,
      avatar_url: (p.avatar_url as string | null) ?? null,
      rating: ratingMap[p.id] ? ratingMap[p.id].sum / ratingMap[p.id].count : null,
      review_count: ratingMap[p.id]?.count ?? 0,
    }))
    .sort((a, b) => {
      if (a.rating == null && b.rating == null) return 0
      if (a.rating == null) return 1
      if (b.rating == null) return -1
      return b.rating - a.rating
    })
    .slice(0, 4)

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
