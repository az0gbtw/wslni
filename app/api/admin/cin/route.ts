import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendCinApprovedEmail, sendCinRejectedEmail } from "@/lib/emails"
import { sanitizeUUID, sanitizeEnum, ValidationError } from "@/lib/sanitize"
import { rateLimit, tooManyRequests } from "@/lib/rate-limit"

const CIN_ACTIONS = ["approve", "reject"] as const

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: caller } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (caller?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (!rateLimit(`admin:cin:${user.id}`, 30, 60_000)) {
    return tooManyRequests()
  }

  let action: "approve" | "reject", userId: string
  try {
    const body = await req.json()
    action = sanitizeEnum(body.action, CIN_ACTIONS, "action")
    userId = sanitizeUUID(body.userId, "userId")
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 })
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const admin = createAdminClient()

  const newStatus = action === "approve" ? "verified" : "rejected"
  const { error: updateError } = await admin
    .from("profiles")
    .update({ cin_status: newStatus })
    .eq("id", userId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .single()

  const { data: authUser } = await admin.auth.admin.getUserById(userId)
  const email = authUser?.user?.email
  const fullName = profile?.full_name ?? "Utilisateur"

  if (email) {
    if (action === "approve") {
      await sendCinApprovedEmail({ email, fullName })
    } else {
      await sendCinRejectedEmail({ email, fullName })
    }
  }

  return NextResponse.json({ ok: true })
}
