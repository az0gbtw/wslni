import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendNewOrderEmail } from "@/lib/emails"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { freelancerId, clientName, serviceTitle, price } = body as {
    freelancerId?: string
    clientName?: string
    serviceTitle?: string
    price?: number
  }

  if (!freelancerId || !clientName || !serviceTitle || price === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(freelancerId)
    if (authError || !authData.user?.email) {
      return NextResponse.json({ error: "Freelancer not found" }, { status: 404 })
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", freelancerId)
      .single()

    const freelancerName =
      profile?.full_name ?? authData.user.email.split("@")[0]

    await sendNewOrderEmail({
      freelancerEmail: authData.user.email,
      freelancerName,
      clientName,
      serviceTitle,
      price,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[email/new-order]", err)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
