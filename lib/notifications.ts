import "server-only"
import { createClient } from "@supabase/supabase-js"

// Module-level singleton to avoid creating a new service-role client on every call.
// This module is server-only, so the key is never exposed to the browser.
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

/**
 * Inserts a notification row for the given user.
 * Most notifications are created by DB triggers; use this only for types not covered there.
 */
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
