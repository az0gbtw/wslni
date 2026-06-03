import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body?.email || body.email !== user.email) {
    return NextResponse.json({ error: "Email confirmation mismatch" }, { status: 400 })
  }

  const userId = user.id
  const admin = createAdminClient()

  // 1. Notifications
  const { error: notifErr } = await admin.from("notifications").delete().eq("user_id", userId)
  if (notifErr) console.error("[delete-account] notifications:", notifErr.message)

  // 2. Favorites
  const { error: favErr } = await admin.from("favorites").delete().eq("user_id", userId)
  if (favErr) console.error("[delete-account] favorites:", favErr.message)

  // 3. Reviews (as client or as freelancer being reviewed)
  const { error: reviewErr } = await admin
    .from("reviews")
    .delete()
    .or(`client_id.eq.${userId},freelancer_id.eq.${userId}`)
  if (reviewErr) console.error("[delete-account] reviews:", reviewErr.message)

  // 4. Messages — find all conversations the user participates in, delete their messages
  const { data: convos, error: convFetchErr } = await admin
    .from("conversations")
    .select("id")
    .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
  if (convFetchErr) console.error("[delete-account] fetch conversations:", convFetchErr.message)

  const convoIds = convos?.map((c: { id: string }) => c.id) ?? []
  if (convoIds.length > 0) {
    const { error: msgErr } = await admin.from("messages").delete().in("conversation_id", convoIds)
    if (msgErr) console.error("[delete-account] messages:", msgErr.message)
  }

  // Also delete order messages for orders the user is part of
  const { data: userOrders, error: orderFetchErr } = await admin
    .from("orders")
    .select("id")
    .or(`client_id.eq.${userId},freelancer_id.eq.${userId}`)
  if (orderFetchErr) console.error("[delete-account] fetch orders:", orderFetchErr.message)

  const orderIds = userOrders?.map((o: { id: string }) => o.id) ?? []
  if (orderIds.length > 0) {
    const { error: oMsgErr } = await admin.from("order_messages").delete().in("order_id", orderIds)
    if (oMsgErr) console.error("[delete-account] order_messages:", oMsgErr.message)
  }

  // 5. Conversations
  if (convoIds.length > 0) {
    const { error: convoErr } = await admin.from("conversations").delete().in("id", convoIds)
    if (convoErr) console.error("[delete-account] conversations:", convoErr.message)
  }

  // 6. Orders
  if (orderIds.length > 0) {
    const { error: ordErr } = await admin.from("orders").delete().in("id", orderIds)
    if (ordErr) console.error("[delete-account] orders:", ordErr.message)
  }

  // 7. Services
  const { error: svcErr } = await admin.from("services").delete().eq("user_id", userId)
  if (svcErr) console.error("[delete-account] services:", svcErr.message)

  // 8. Profile row
  const { error: profileErr } = await admin.from("profiles").delete().eq("id", userId)
  if (profileErr) console.error("[delete-account] profile:", profileErr.message)

  // 9. Auth user — must be last
  const { error: authErr } = await admin.auth.admin.deleteUser(userId)
  if (authErr) {
    console.error("[delete-account] auth user:", authErr.message)
    return NextResponse.json({ error: authErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
