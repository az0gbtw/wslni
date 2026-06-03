import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendNewOrderEmail } from "@/lib/emails"
import { sanitizeUUID, sanitizeString, sanitizeNonNegativeNumber, ValidationError } from "@/lib/sanitize"
import { rateLimit, getClientIp, tooManyRequests } from "@/lib/rate-limit"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  if (!rateLimit(`emails:new-order:${getClientIp(request)}`, 10, 60_000)) {
    return tooManyRequests()
  }

  let freelancerId: string, clientName: string, serviceTitle: string, price: number
  try {
    const body = await request.json()
    freelancerId = sanitizeUUID(body.freelancerId, "freelancerId")
    clientName = sanitizeString(body.clientName, 100, "clientName")
    serviceTitle = sanitizeString(body.serviceTitle, 200, "serviceTitle")
    price = sanitizeNonNegativeNumber(body.price, "price")
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 })
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
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
