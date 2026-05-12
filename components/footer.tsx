"use client"

import { Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
]

function ZelligeDivider() {
  return (
    <div className="w-full h-2 flex overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-full ${
            i % 4 === 0
              ? "bg-primary"
              : i % 4 === 1
              ? "bg-primary/70"
              : i % 4 === 2
              ? "bg-secondary"
              : "bg-primary/40"
          }`}
        />
      ))}
    </div>
  )
}

export function Footer() {
  const { lang } = useLanguage()
  const t = translations[lang].footer

  const sections = [t.services, t.company, t.support]

  return (
    <footer className="bg-foreground text-background">
      <ZelligeDivider />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
                <span className="text-xl font-bold text-primary-foreground">W</span>
              </div>
              <span className="text-xl font-bold">Wslni.ma</span>
            </a>
            <p className="text-sm text-background/70 mb-6 max-w-xs">
              {t.tagline}
            </p>

            <div className="flex gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-9 h-9 rounded-full bg-background/10 hover:bg-primary flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Link columns */}
          {sections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((label, linkIndex) => (
                  <li key={linkIndex}>
                    <a href="#" className="text-sm text-background/70 hover:text-primary transition-colors">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-background/10">
          <p className="text-sm text-background/50">{t.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
