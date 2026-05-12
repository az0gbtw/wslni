import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendNewMessageEmail } from "@/lib/emails"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { recipientId, senderName, messagePreview } = body as {
    recipientId?: string
    senderName?: string
    messagePreview?: string
  }

  if (!recipientId || !senderName || !messagePreview) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
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
