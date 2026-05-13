"use client"

import { useEffect, useRef } from "react"

export function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      container.querySelectorAll<HTMLElement>(".reveal").forEach((el) => {
        el.classList.add("in-view")
      })
      return
    }

    const items = Array.from(container.querySelectorAll<HTMLElement>(".reveal"))
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view")
            observer.unobserve(entry.target)
            // Clear stagger delay after reveal finishes so hover/click feel instant.
            // Filter to the element itself — child transitionend events bubble and would
            // fire the listener before the reveal animation actually completes.
            const el = entry.target as HTMLElement
            const clearDelay = (e: Event) => {
              if (e.target === el) {
                el.style.transitionDelay = ""
                el.removeEventListener("transitionend", clearDelay)
              }
            }
            el.addEventListener("transitionend", clearDelay)
          }
        })
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    )

    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [threshold])

  return ref
}
