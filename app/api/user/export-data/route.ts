import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const uid = user.id

  const [
    profileRes,
    servicesRes,
    ordersClientRes,
    ordersFreelancerRes,
    conversationsRes,
    notificationsRes,
    favoritesRes,
    reviewsGivenRes,
    reviewsReceivedRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", uid).single(),
    supabase.from("services").select("*").eq("user_id", uid),
    supabase.from("orders").select("*").eq("client_id", uid),
    supabase.from("orders").select("*").eq("freelancer_id", uid),
    supabase.from("conversations").select("*").or(`participant1_id.eq.${uid},participant2_id.eq.${uid}`),
    supabase.from("notifications").select("*").eq("user_id", uid),
    supabase.from("favorites").select("*").eq("user_id", uid),
    supabase.from("reviews").select("*").eq("client_id", uid),
    supabase.from("reviews").select("*").eq("freelancer_id", uid),
  ])

  const convoIds = (conversationsRes.data ?? []).map((c: { id: string }) => c.id)

  const [messagesRes, orderMessagesRes] = await Promise.all([
    convoIds.length > 0
      ? supabase.from("messages").select("*").in("conversation_id", convoIds).eq("sender_id", uid)
      : Promise.resolve({ data: [] }),
    supabase.from("order_messages").select("*").eq("sender_id", uid),
  ])

  const payload = {
    exported_at: new Date().toISOString(),
    profile: profileRes.data ?? null,
    services: servicesRes.data ?? [],
    orders_as_client: ordersClientRes.data ?? [],
    orders_as_freelancer: ordersFreelancerRes.data ?? [],
    conversations: conversationsRes.data ?? [],
    messages: messagesRes.data ?? [],
    order_messages: orderMessagesRes.data ?? [],
    reviews_given: reviewsGivenRes.data ?? [],
    reviews_received: reviewsReceivedRes.data ?? [],
    notifications: notificationsRes.data ?? [],
    favorites: favoritesRes.data ?? [],
  }

  const json = JSON.stringify(payload, null, 2)

  return new NextResponse(json, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="wslni-mes-donnees.json"',
    },
  })
}
