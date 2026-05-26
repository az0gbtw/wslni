import type { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"

const BASE_URL = "https://wslni.ma"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const [{ data: services }, { data: profiles }] = await Promise.all([
    supabase.from("services").select("id, updated_at").eq("status", "published"),
    supabase
      .from("profiles")
      .select("id, updated_at")
      .not("job_title", "is", null)
      .not("bio", "is", null),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,           lastModified: new Date(), changeFrequency: "daily",   priority: 1 },
    { url: `${BASE_URL}/services`,   lastModified: new Date(), changeFrequency: "hourly",  priority: 0.9 },
    { url: `${BASE_URL}/connexion`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/inscription`,lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ]

  const servicePages: MetadataRoute.Sitemap = (services ?? []).map((s) => ({
    url: `${BASE_URL}/services/${s.id}`,
    lastModified: s.updated_at ? new Date(s.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  const profilePages: MetadataRoute.Sitemap = (profiles ?? []).map((p) => ({
    url: `${BASE_URL}/profil/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  return [...staticPages, ...servicePages, ...profilePages]
}
