import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendNewMessageEmail } from "@/lib/emails"
import { sanitizeUUID, sanitizeString, ValidationError } from "@/lib/sanitize"
import { rateLimit, getClientIp, tooManyRequests } from "@/lib/rate-limit"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  if (!rateLimit(`emails:new-message:${getClientIp(request)}`, 30, 60_000)) {
    return tooManyRequests()
  }

  let recipientId: string, senderName: string, messagePreview: string
  try {
    const body = await request.json()
    recipientId = sanitizeUUID(body.recipientId, "recipientId")
    senderName = sanitizeString(body.senderName, 100, "senderName")
    messagePreview = sanitizeString(body.messagePreview, 500, "messagePreview")
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 })
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(recipientId)
    if (authError || !authData.user?.email) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 })
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", recipientId)
      .single()

    const recipientName = profile?.full_name ?? authData.user.email.split("@")[0]

    await sendNewMessageEmail({
      recipientEmail: authData.user.email,
      recipientName,
      senderName,
      messagePreview,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[email/new-message]", err)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
