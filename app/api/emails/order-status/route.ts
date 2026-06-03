import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendOrderStatusEmail } from "@/lib/emails"
import { sanitizeUUID, sanitizeString, sanitizeOptionalString, sanitizeNonNegativeNumber, ValidationError } from "@/lib/sanitize"
import { rateLimit, getClientIp, tooManyRequests } from "@/lib/rate-limit"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  if (!rateLimit(`emails:order-status:${getClientIp(request)}`, 10, 60_000)) {
    return tooManyRequests()
  }

  let clientId: string, serviceTitle: string, newStatus: string
  let freelancerName: string | undefined, price: number | undefined
  try {
    const body = await request.json()
    clientId = sanitizeUUID(body.clientId, "clientId")
    serviceTitle = sanitizeString(body.serviceTitle, 200, "serviceTitle")
    newStatus = sanitizeString(body.newStatus, 50, "newStatus")
    freelancerName = sanitizeOptionalString(body.freelancerName, 100, "freelancerName")
    price = typeof body.price === "number" ? sanitizeNonNegativeNumber(body.price, "price") : undefined
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 })
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
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
