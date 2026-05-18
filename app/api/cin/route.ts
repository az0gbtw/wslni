import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  // Identify the caller with the cookie-based session client
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles")
    .select("cin_status")
    .eq("id", user.id)
    .single()

  if (profile?.cin_status === "pending") {
    return NextResponse.json({ error: "Already pending" }, { status: 409 })
  }

  // Parse the uploaded file from multipart form data
  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const uploadPath = `${user.id}/cin.${ext}`

  console.log("[CIN upload] path:", uploadPath, "| type:", file.type, "| size:", file.size)

  // Use the service-role admin client to bypass RLS on storage.objects
  const admin = createAdminClient()
  const { error: storageError } = await admin.storage
    .from("cin-uploads")
    .upload(uploadPath, file, { upsert: true, contentType: file.type })

  if (storageError) {
    console.error("[CIN upload] storage error:", storageError)
    return NextResponse.json({ error: storageError.message }, { status: 500 })
  }

  // Update cin_status in profiles (regular client respects user's own-row RLS)
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
