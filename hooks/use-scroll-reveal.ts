"use client"

import { useEffect, useRef } from "react"

export function useScrollReveal(threshold = 0.12) {
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
