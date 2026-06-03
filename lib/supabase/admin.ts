import { createClient } from "@supabase/supabase-js"

/**
 * Creates a service-role Supabase client that bypasses Row Level Security.
 * Call only from server-side code (Route Handlers, Server Actions).
 * autoRefreshToken/persistSession are off because this client is short-lived per request.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
