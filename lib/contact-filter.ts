export interface FilterResult {
  filtered: string
  wasFiltered: boolean
}

export function filterContactInfo(content: string): FilterResult {
  let text = content

  // Email addresses (must run before @handle filter)
  text = text.replace(
    /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
    "[email masqué]"
  )

  // Moroccan phones — international prefix (+212 or 00212), optional leading 0 before 6/7
  text = text.replace(
    /(?:\+212|00212)[\s.\-]?0?[67](?:[\s.\-]?\d{2}){4}/g,
    "[numéro masqué]"
  )

  // Moroccan phones — local format: 06/07 followed by 8 digits (with optional separators)
  text = text.replace(
    /(?<![0-9])0[67](?:[\s.\-]?\d{2}){4}(?!\d)/g,
    "[numéro masqué]"
  )

  // WhatsApp keywords (case insensitive)
  text = text.replace(
    /\b(?:whats?\s*app|watsapp|wa\.me)\b/gi,
    "[contact masqué]"
  )

  // Email provider names sent standalone or in context
  text = text.replace(
    /\b(?:gmail|hotmail|outlook|yahoo|icloud|proton(?:mail)?|ymail)\b/gi,
    "[contact masqué]"
  )

  // Phrases inviting off-platform contact via mail/email
  text = text.replace(
    /\b(?:on\s+parle\s+par\s+(?:e?-?mail)|envoie[- ]?moi\s+(?:un\s+)?(?:e?-?mail)|contacte[- ]?moi\s+par\s+(?:e?-?mail)|par\s+e?-?mail)\b/gi,
    "[contact masqué]"
  )

  // "viens on parle / on se parle / on discute" followed by an off-platform channel
  text = text.replace(
    /\b(?:vien[st]?\s+on\s+(?:se\s+)?parle|on\s+se\s+parle|on\s+discute)\b[\s\S]{0,30}?\b(?:e?-?mail|whats?\s*app|watsapp|insta(?:gram)?|snap(?:chat)?)\b/gi,
    "[contact masqué]"
  )

  // @username handles (Instagram, Snapchat, etc.)
  text = text.replace(
    /@[a-zA-Z0-9_.]{2,30}/g,
    "[contact masqué]"
  )

  // Catch fragmented phone numbers: any run of 4+ consecutive digits not in a safe context.
  // Runs last so the specific patterns above have already been handled.
  text = text.replace(/\d{4,}/g, (match, offset: number, str: string) => {
    const num = parseInt(match, 10)

    // Allow years 1900–2099 (exactly 4 digits)
    if (match.length === 4 && num >= 1900 && num <= 2099) return match

    // Allow price/amount context: look up to 10 chars before and after for
    // MAD, DH, dirham, درهم, or a percent sign.
    const ctxBefore = str.slice(Math.max(0, offset - 10), offset)
    const ctxAfter  = str.slice(offset + match.length, offset + match.length + 10)

    const priceBefore = /(?:MAD|DH|dirham|درهم)\s*$/i.test(ctxBefore)
    // After may include decimal separator before the keyword (e.g. "1500.50 MAD")
    const priceAfter  = /^[.,\d\s]*\s*(?:MAD|DH|dirham|درهم|%)/i.test(ctxAfter)

    if (priceBefore || priceAfter) return match

    return "[numéro masqué]"
  })

  return { filtered: text, wasFiltered: text !== content }
}
