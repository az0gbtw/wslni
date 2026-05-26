import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let freelancerId: string
  try {
    const body = await request.json()
    freelancerId = body.freelancerId
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  if (!freelancerId || typeof freelancerId !== "string") {
    return NextResponse.json({ error: "Missing freelancerId" }, { status: 400 })
  }

  if (freelancerId === user.id) {
    return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 })
  }

  // Sorted IDs ensure the UNIQUE constraint (participant1_id, participant2_id) works correctly
  const [p1, p2] = [user.id, freelancerId].sort()

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("participant1_id", p1)
    .eq("participant2_id", p2)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ conversationId: existing.id })
  }

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ participant1_id: p1, participant2_id: p2 })
    .select("id")
    .single()

  if (error || !created) {
    // Race condition: another request may have created it simultaneously
    const { data: retry } = await supabase
      .from("conversations")
      .select("id")
      .eq("participant1_id", p1)
      .eq("participant2_id", p2)
      .maybeSingle()

    if (retry) return NextResponse.json({ conversationId: retry.id })
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }

  return NextResponse.json({ conversationId: created.id })
}
