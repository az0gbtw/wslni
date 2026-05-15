"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, CheckCircle2, KeyRound, Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type PageState = "loading" | "ready" | "submitting" | "success" | "invalid"
type PasswordStrength = "faible" | "moyen" | "fort"

function getPasswordStrength(pwd: string): PasswordStrength | null {
  if (!pwd) return null
  if (pwd.length < 8) return "faible"
  const hasUpper = /[A-Z]/.test(pwd)
  const hasNumber = /[0-9]/.test(pwd)
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd)
  const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length
  if (score >= 2) return "fort"
  return "moyen"
}

const strengthConfig = {
  faible: { label: "Faible", color: "bg-red-500", width: "w-1/3", textColor: "text-red-600" },
  moyen: { label: "Moyen", color: "bg-amber-500", width: "w-2/3", textColor: "text-amber-600" },
  fort: { label: "Fort", color: "bg-emerald-500", width: "w-full", textColor: "text-emerald-600" },
}

function Logo() {
  return (
    <div className="flex justify-center mb-8">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
          <span className="text-2xl font-bold text-primary-foreground">W</span>
        </div>
        <span className="text-2xl font-bold text-foreground">Wslni.ma</span>
      </Link>
    </div>
  )
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [pageState, setPageState] = useState<PageState>("loading")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [countdown, setCountdown] = useState(3)

  // Detect the recovery session from the URL (supports both PKCE ?code= and
  // implicit #access_token= flows, depending on Supabase project settings).
  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setPageState("ready")
      }
    })

    // Fallback: session may already be established by the time the listener
    // is attached (race condition), but only trust it if a recovery token is
    // actually present in the URL so we don't greet logged-in users with a
    // blank password form.
    const hasToken =
      window.location.hash.includes("type=recovery") ||
      new URLSearchParams(window.location.search).has("code")

    if (hasToken) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setPageState(prev => (prev === "loading" ? "ready" : prev))
        }
      })
    }

    // If nothing establishes the session in 5 s, the link is invalid/expired.
    const timer = setTimeout(() => {
      setPageState(prev => (prev === "loading" ? "invalid" : prev))
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  // Countdown redirect after success
  useEffect(() => {
    if (pageState !== "success") return
    if (countdown === 0) {
      router.push("/connexion")
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [pageState, countdown, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.")
      return
    }

    setPageState("submitting")

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError("Une erreur est survenue. Veuillez réessayer.")
      setPageState("ready")
      return
    }

    setPageState("success")
  }

  /* ── Loading ── */
  if (pageState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Vérification du lien…</p>
        </div>
      </div>
    )
  }

  /* ── Invalid / expired link ── */
  if (pageState === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <Logo />
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm text-center">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="h-7 w-7 text-destructive" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Lien invalide ou expiré</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Ce lien de réinitialisation est invalide ou a expiré. Veuillez en demander un nouveau.
            </p>
            <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/mot-de-passe-oublie">Demander un nouveau lien</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Success ── */
  if (pageState === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <Logo />
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Mot de passe mis à jour !</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la connexion dans{" "}
              <span className="font-semibold text-foreground">{countdown}</span>{" "}
              seconde{countdown !== 1 ? "s" : ""}…
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/connexion">Se connecter maintenant</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Form (ready | submitting) ── */
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Logo />
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-foreground">Nouveau mot de passe</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Choisissez un mot de passe sécurisé pour votre compte.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null) }}
                  required
                  autoComplete="new-password"
                  className="pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute inset-y-0 end-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPass ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {(() => {
              const strength = getPasswordStrength(password)
              if (!strength) return null
              const cfg = strengthConfig[strength]
              return (
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${cfg.color} ${cfg.width}`} />
                  </div>
                  <p className={`text-xs font-medium ${cfg.textColor}`}>Sécurité : {cfg.label}</p>
                </div>
              )
            })()}

            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError(null) }}
                  required
                  autoComplete="new-password"
                  className="pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute inset-y-0 end-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirm ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={pageState === "submitting"}
            >
              {pageState === "submitting" ? (
                <>
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  Mise à jour…
                </>
              ) : (
                "Réinitialiser le mot de passe"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
