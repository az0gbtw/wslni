"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { X, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const SESSION_KEY = "wslni_welcome_dismissed"

export function WelcomeModal() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return

    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) return
      const timer = setTimeout(() => setVisible(true), 3000)
      return () => clearTimeout(timer)
    })
  }, [])

  function dismiss() {
    sessionStorage.setItem(SESSION_KEY, "1")
    setVisible(false)
  }

  function handleGoogleSignIn() {
    const supabase = createClient()
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/auth/callback" },
    })
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && dismiss()}
    >
      <div className="animate-scaleIn w-full sm:max-w-2xl bg-white sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:flex-row rounded-t-2xl">
        {/* Left — brand panel — hidden on mobile, shown on sm+ */}
        <div className="hidden sm:flex bg-primary text-primary-foreground flex-col justify-between p-8 w-5/12 relative shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20">
              <span className="text-2xl font-bold">W</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">Wslni.ma</span>
          </div>

          {/* Tagline */}
          <p className="mt-4 text-sm text-white/80 leading-relaxed">
            La plateforme freelance 100% marocaine
          </p>

          {/* Bullet points */}
          <ul className="mt-6 space-y-4 flex-1">
            {[
              "Des freelancers marocains vérifiés",
              "Paiement en dirhams, sans frais cachés",
              "Support en darija et français",
            ].map((text) => (
              <li key={text} className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-white/25">
                  <Check className="w-3 h-3" strokeWidth={3} />
                </span>
                <span className="text-sm leading-snug">{text}</span>
              </li>
            ))}
          </ul>

          {/* Decorative circle */}
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        </div>

        {/* Right — auth panel */}
        <div className="flex-1 bg-white p-6 sm:p-8 flex flex-col relative">
          {/* Close button */}
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Mobile-only brand badge */}
          <div className="flex items-center gap-2 mb-4 sm:hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <span className="text-base font-bold text-white">W</span>
            </div>
            <span className="text-base font-bold text-gray-900">Wslni.ma</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Rejoignez Wslni
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Déjà un compte ?{" "}
            <Link href="/connexion" onClick={dismiss} className="text-primary font-medium hover:underline">
              Connectez-vous
            </Link>
          </p>

          <div className="mt-5 flex flex-col gap-3">
            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors px-4 py-3 shadow-sm min-h-[44px]"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
              </svg>
              Continuer avec Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">ou</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Sign up */}
            <Link
              href="/inscription"
              onClick={dismiss}
              className="w-full flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-semibold px-4 py-3 hover:bg-primary/90 transition-colors min-h-[44px]"
            >
              S&apos;inscrire avec email
            </Link>

            {/* Sign in */}
            <Link
              href="/connexion"
              onClick={dismiss}
              className="w-full flex items-center justify-center rounded-lg border border-gray-200 text-sm font-medium text-gray-700 px-4 py-3 hover:bg-gray-50 transition-colors min-h-[44px]"
            >
              Se connecter
            </Link>
          </div>

          {/* Terms */}
          <p className="mt-auto pt-5 text-xs text-gray-400 text-center leading-relaxed">
            En rejoignant Wslni, vous acceptez nos{" "}
            <Link href="/conditions" onClick={dismiss} className="underline hover:text-gray-600">
              conditions d&apos;utilisation
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
