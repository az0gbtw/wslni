import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { rateLimit, getClientIp, tooManyRequests } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  if (!rateLimit(`auth:callback:${getClientIp(request)}`, 10, 60_000)) {
    return tooManyRequests()
  }

  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  // Sanitize the redirect target — only allow same-origin relative paths
  const rawNext = searchParams.get("next") ?? "/dashboard"
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/connexion?error=auth`)
}
