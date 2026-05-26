import type { SupabaseClient } from "@supabase/supabase-js"
import { filterContactInfo } from "./contact-filter"

export interface CrossMessageResult {
  finalContent: string
  wasFiltered: boolean
  crossMessageDetected: boolean
  maskedMessageIds: string[]
}

/**
 * Fetches the last 10 messages sent by the same sender in the last 5 minutes,
 * concatenates them with the new message, and runs the contact filter on the
 * combined string. If the combination triggers a match that the new message
 * alone did not, the sender is reconstructing contact info across messages.
 *
 * Returns the content to save, whether filtering occurred, and the IDs of any
 * previous messages retroactively masked.
 */
export async function checkCrossMessageContext(
  supabase: SupabaseClient,
  conversationId: string,
  senderId: string,
  trimmedContent: string,
  filteredContent: string,
  wasFilteredAlone: boolean
): Promise<CrossMessageResult> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

  const { data: recentMsgs } = await supabase
    .from("messages")
    .select("id, content")
    .eq("conversation_id", conversationId)
    .eq("sender_id", senderId)
    .gte("created_at", fiveMinutesAgo)
    .order("created_at", { ascending: true })
    .limit(10)

  const recent = recentMsgs ?? []

  if (recent.length === 0) {
    return { finalContent: filteredContent, wasFiltered: wasFilteredAlone, crossMessageDetected: false, maskedMessageIds: [] }
  }

  const combined = [...recent.map((m) => m.content), trimmedContent].join("")
  const { wasFiltered: wasFilteredCombined } = filterContactInfo(combined)

  // Only flag as cross-message when the combined string triggers something the
  // new message alone did not — avoids masking innocent prior messages when the
  // new message itself already triggered the per-message filter.
  if (!wasFilteredCombined || wasFilteredAlone) {
    return { finalContent: filteredContent, wasFiltered: wasFilteredAlone, crossMessageDetected: false, maskedMessageIds: [] }
  }

  // Retroactively mask previous messages that contain digits (the actual fragments).
  // Messages with no digits (greetings, normal text) are left untouched.
  const toMask = recent.filter((m) => /\d/.test(m.content))
  const maskedMessageIds = toMask.map((m) => m.id)

  if (maskedMessageIds.length > 0) {
    await supabase
      .from("messages")
      .update({ content: "[contact masqué]" })
      .in("id", maskedMessageIds)
  }

  return { finalContent: "[contact masqué]", wasFiltered: true, crossMessageDetected: true, maskedMessageIds }
}
