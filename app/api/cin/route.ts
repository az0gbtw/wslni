import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { rateLimit, tooManyRequests } from "@/lib/rate-limit"

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"])
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!rateLimit(`cin:${user.id}`, 5, 60_000)) {
    return tooManyRequests()
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("cin_status")
    .eq("id", user.id)
    .single()

  if (profile?.cin_status === "pending") {
    return NextResponse.json({ error: "Already pending" }, { status: 409 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: "File must be an image (JPEG, PNG, WebP) or PDF" }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File must be at most 5 MB" }, { status: 400 })
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const uploadPath = `${user.id}/cin.${ext}`

  console.log("[CIN upload] path:", uploadPath, "| type:", file.type, "| size:", file.size)

  const admin = createAdminClient()
  const { error: storageError } = await admin.storage
    .from("cin-uploads")
    .upload(uploadPath, file, { upsert: true, contentType: file.type })

  if (storageError) {
    console.error("[CIN upload] storage error:", storageError)
    return NextResponse.json({ error: storageError.message }, { status: 500 })
  }

  const { error: dbError } = await supabase
    .from("profiles")
    .update({ cin_status: "pending", cin_uploaded_at: new Date().toISOString() })
    .eq("id", user.id)

  if (dbError) {
    console.error("[CIN upload] db error:", dbError)
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
