import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { filterContactInfo } from "@/lib/contact-filter"
import { checkCrossMessageContext } from "@/lib/cross-message-filter"

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let conversationId: string, content: string
  try {
    const body = await request.json()
    conversationId = body.conversation_id
    content = body.content
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  if (!conversationId || !content?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  // Verify user is a participant in this conversation
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
