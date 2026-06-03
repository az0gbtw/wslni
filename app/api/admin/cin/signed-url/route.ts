import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sanitizeUUID, ValidationError } from "@/lib/sanitize"
import { rateLimit, tooManyRequests } from "@/lib/rate-limit"

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: caller } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (caller?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (!rateLimit(`admin:cin-url:${user.id}`, 30, 60_000)) {
    return tooManyRequests()
  }

  let userId: string
  try {
    userId = sanitizeUUID(req.nextUrl.searchParams.get("userId"), "userId")
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 })
    return NextResponse.json({ error: "Missing userId" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from("cin-uploads")
    .createSignedUrl(`${userId}/cin.jpg`, 3600)

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Could not generate signed URL" }, { status: 500 })
  }

  return NextResponse.json({ url: data.signedUrl })
}
