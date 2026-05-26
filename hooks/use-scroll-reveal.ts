"use client"

import { useEffect, useRef } from "react"

export function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    // No-op if the browser can't support the animation — elements stay visible (default)
    if (typeof IntersectionObserver === "undefined") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const items = Array.from(container.querySelectorAll<HTMLElement>(".reveal"))
    if (items.length === 0) return

    const vh = window.innerHeight

    // Only hide elements that are entirely below the fold at mount time.
    // Elements already in the viewport are left visible so they never flicker.
    const offScreen = items.filter((el) => el.getBoundingClientRect().top >= vh)
    if (offScreen.length === 0) return

    offScreen.forEach((el) => el.classList.add("reveal-hidden"))

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            el.classList.remove("reveal-hidden")
            el.classList.add("in-view")
            observer.unobserve(el)
            // Clear stagger delay after the reveal transition so hover feels instant
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
      { threshold, rootMargin: "0px 0px -40px 0px" },
    )

    offScreen.forEach((el) => observer.observe(el))
    return () => {
      observer.disconnect()
      // Safety net: if the component unmounts before reveal fires, restore visibility
      offScreen.forEach((el) => el.classList.remove("reveal-hidden"))
    }
  }, [threshold])

  return ref
}
