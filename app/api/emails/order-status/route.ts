import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendOrderStatusEmail } from "@/lib/emails"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { clientId, freelancerName, serviceTitle, newStatus, price } = body as {
    clientId?: string
    freelancerName?: string
    serviceTitle?: string
    newStatus?: string
    price?: number
  }

  if (!clientId || !serviceTitle || !newStatus) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(clientId)
    if (authError || !authData.user?.email) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", clientId)
      .single()

    const clientName = profile?.full_name ?? authData.user.email.split("@")[0]

    await sendOrderStatusEmail({
      clientEmail: authData.user.email,
      clientName,
      freelancerName: freelancerName ?? "Freelance",
      serviceTitle,
      newStatus,
      price: price ?? 0,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[email/order-status]", err)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
