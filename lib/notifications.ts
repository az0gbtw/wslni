import "server-only"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type NotificationType =
  | "new_order"
  | "order_accepted"
  | "order_delivered"
  | "order_completed"
  | "new_message"

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link: string
): Promise<void> {
  await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    body: message,
    link,
  })
}
