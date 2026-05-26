import { createClient } from "@/lib/supabase/server"
import PublicProfilePage from "./profile-client"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, bio")
    .eq("id", id)
    .single()

  if (!profile) return { title: "Profil | Wslni.ma" }

  return {
    title: `${profile.full_name ?? "Freelancer"} — Freelancer sur Wslni.ma`,
    description:
      (profile.bio as string | null)?.slice(0, 155) ??
      `Découvrez le profil de ${profile.full_name ?? "ce freelancer"} sur Wslni.ma`,
  }
}

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="page-enter">
      <PublicProfilePage params={params} />
    </div>
  )
}
