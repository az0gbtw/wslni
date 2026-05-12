import { NextRequest, NextResponse } from "next/server"
import { sendWelcomeEmail } from "@/lib/emails"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, fullName } = body as { email?: string; fullName?: string }

  if (!email || !fullName) {
    return NextResponse.json({ error: "email and fullName are required" }, { status: 400 })
  }

  try {
    await sendWelcomeEmail(email, fullName)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[email/welcome]", err)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
