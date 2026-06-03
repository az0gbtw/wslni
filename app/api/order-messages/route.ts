import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { filterContactInfo } from "@/lib/contact-filter"
import { checkCrossMessageContext } from "@/lib/cross-message-filter"
import { sanitizeUUID, sanitizeString, ValidationError } from "@/lib/sanitize"
import { rateLimit, tooManyRequests } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!rateLimit(`order-messages:${user.id}`, 60, 60_000)) {
    return tooManyRequests()
  }

  let conversationId: string, content: string, orderId: string
  try {
    const body = await request.json()
    conversationId = sanitizeUUID(body.conversation_id, "conversation_id")
    content = sanitizeString(body.content, 5000, "content")
    orderId = sanitizeUUID(body.order_id, "order_id")
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 })
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  // Verify user is a party on this order
  const { data: order } = await supabase
    .from("orders")
    .select("client_id, freelancer_id")
    .eq("id", orderId)
    .single()

  if (!order || (order.client_id !== user.id && order.freelancer_id !== user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Verify user is a participant in the conversation
  const { data: conv } = await supabase
    .from("conversations")
    .select("participant1_id, participant2_id")
    .eq("id", conversationId)
    .single()

  if (!conv || (conv.participant1_id !== user.id && conv.participant2_id !== user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const trimmed = content.trim()
  const { filtered: filteredContent, wasFiltered: wasFilteredAlone } = filterContactInfo(trimmed)

  const { finalContent, wasFiltered, crossMessageDetected, maskedMessageIds } =
    await checkCrossMessageContext(supabase, conversationId, user.id, trimmed, filteredContent, wasFilteredAlone)

  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: user.id, content: finalContent })
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }

  return NextResponse.json({ message: data, wasFiltered, crossMessageDetected, maskedMessageIds })
}
