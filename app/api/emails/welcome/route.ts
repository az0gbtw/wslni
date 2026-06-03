import { NextRequest, NextResponse } from "next/server"
import { sendWelcomeEmail } from "@/lib/emails"
import { sanitizeEmail, sanitizeString, ValidationError } from "@/lib/sanitize"
import { rateLimit, getClientIp, tooManyRequests } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  if (!rateLimit(`emails:welcome:${getClientIp(request)}`, 5, 60_000)) {
    return tooManyRequests()
  }

  let email: string, fullName: string
  try {
    const body = await request.json()
    email = sanitizeEmail(body.email, "email")
    fullName = sanitizeString(body.fullName, 100, "fullName")
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 })
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  try {
    await sendWelcomeEmail(email, fullName)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[email/welcome]", err)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
