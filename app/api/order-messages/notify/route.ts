import { NextRequest, NextResponse } from "next/server"
import { createNotification } from "@/lib/notifications"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { recipientId, senderName, orderId, messagePreview } = body as {
    recipientId?: string
    senderName?: string
    orderId?: string
    messagePreview?: string
  }

  if (!recipientId || !senderName || !orderId || !messagePreview) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
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
