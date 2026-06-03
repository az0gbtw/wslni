// In-memory fixed-window rate limiter.
// Each Vercel serverless function instance has its own store — this won't coordinate
// across concurrent instances, but provides meaningful per-instance protection.
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()
let lastCleanup = Date.now()

function cleanup(now: number) {
  if (now - lastCleanup < 60_000) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key)
  }
}

/** Returns true if the request is within the limit; false if it should be rejected. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  cleanup(now)
  const entry = store.get(key)
  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

export function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
}

export function tooManyRequests(): NextResponse {
  return NextResponse.json({ error: "Too many requests" }, { status: 429 })
}
