"use client"

import { Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react"

const footerLinks = {
  services: {
    title: "Services",
    links: [
      { label: "Design & Créatif", href: "#" },
      { label: "Développement", href: "#" },
      { label: "Marketing Digital", href: "#" },
      { label: "Rédaction", href: "#" },
      { label: "Vidéo & Audio", href: "#" },
    ],
  },
  entreprise: {
    title: "Entreprise",
    links: [
      { label: "À propos", href: "#" },
      { label: "Comment ça marche", href: "#" },
      { label: "Devenir freelance", href: "#" },
      { label: "Carrières", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  support: {
    title: "Support",
    links: [
      { label: "Centre d'aide", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Conditions d'utilisation", href: "#" },
      { label: "Politique de confidentialité", href: "#" },
      { label: "FAQ", href: "#" },
    ],
  },
}

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
  return (
    <footer className="bg-foreground text-background">
      {/* Zellige Pattern Divider */}
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
              La première marketplace freelance 100% marocaine. Trouve le talent qu&apos;il te faut.
            </p>
            
            {/* Social Links */}
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

          {/* Links Columns */}
          {Object.values(footerLinks).map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-sm text-background/70 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-background/10">
          <p className="text-sm text-background/50">
            © 2025 Wslni.ma. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
