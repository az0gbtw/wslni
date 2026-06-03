import { NextRequest, NextResponse } from "next/server"
import { createNotification } from "@/lib/notifications"
import { sanitizeUUID, sanitizeString, ValidationError } from "@/lib/sanitize"
import { rateLimit, getClientIp, tooManyRequests } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  if (!rateLimit(`order-notify:${getClientIp(request)}`, 30, 60_000)) {
    return tooManyRequests()
  }

  let recipientId: string, senderName: string, orderId: string, messagePreview: string
  try {
    const body = await request.json()
    recipientId = sanitizeUUID(body.recipientId, "recipientId")
    senderName = sanitizeString(body.senderName, 100, "senderName")
    orderId = sanitizeUUID(body.orderId, "orderId")
    messagePreview = sanitizeString(body.messagePreview, 500, "messagePreview")
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 })
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  try {
    await createNotification(
      recipientId,
      "new_message",
      `Nouveau message de ${senderName}`,
      messagePreview.slice(0, 100),
      `/commandes/${orderId}`
    )
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[order-messages/notify]", err)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
