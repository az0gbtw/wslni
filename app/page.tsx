import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { CategoriesSection } from "@/components/categories-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { FeaturedFreelancersSection } from "@/components/featured-freelancers-section"
import { TrustBannerSection } from "@/components/trust-banner-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <CategoriesSection />
      <HowItWorksSection />
      <FeaturedFreelancersSection />
      <TrustBannerSection />
      <Footer />
    </main>
  )
}
