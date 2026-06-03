export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ValidationError"
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function sanitizeString(val: unknown, maxLength: number, field = "field"): string {
  if (typeof val !== "string") throw new ValidationError(`${field} must be a string`)
  const trimmed = val.trim()
  if (!trimmed) throw new ValidationError(`${field} is required`)
  if (trimmed.length > maxLength) throw new ValidationError(`${field} must be at most ${maxLength} characters`)
  return trimmed
}

export function sanitizeOptionalString(val: unknown, maxLength: number, field = "field"): string | undefined {
  if (val == null || val === "") return undefined
  return sanitizeString(val, maxLength, field)
}

export function sanitizeUUID(val: unknown, field = "field"): string {
  const s = sanitizeString(val, 36, field)
  if (!UUID_RE.test(s)) throw new ValidationError(`${field} must be a valid UUID`)
  return s.toLowerCase()
}

export function sanitizeEmail(val: unknown, field = "email"): string {
  const s = sanitizeString(val, 254, field)
  const at = s.indexOf("@")
  if (at < 1 || !s.slice(at + 1).includes(".")) throw new ValidationError(`${field} must be a valid email address`)
  return s.toLowerCase()
}

export function sanitizeEnum<T extends string>(val: unknown, allowed: readonly T[], field = "field"): T {
  const s = sanitizeString(val, 64, field)
  if (!allowed.includes(s as T)) throw new ValidationError(`${field} must be one of: ${allowed.join(", ")}`)
  return s as T
}

export function sanitizeNumber(val: unknown, field = "field"): number {
  if (typeof val !== "number" || !Number.isFinite(val)) throw new ValidationError(`${field} must be a finite number`)
  return val
}

export function sanitizeNonNegativeNumber(val: unknown, field = "field"): number {
  const n = sanitizeNumber(val, field)
  if (n < 0) throw new ValidationError(`${field} must not be negative`)
  return n
}

export function sanitizePath(val: unknown, field = "path"): string {
  const s = sanitizeString(val, 500, field)
  // Only allow same-origin paths — must start with / but not //
  if (!s.startsWith("/") || s.startsWith("//")) throw new ValidationError(`${field} must be a relative path`)
  return s
}
