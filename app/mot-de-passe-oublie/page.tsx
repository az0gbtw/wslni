"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type PageState = "idle" | "submitting" | "success"

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("")
  const [pageState, setPageState] = useState<PageState>("idle")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPageState("submitting")

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    })

    if (error) {
      setError("Une erreur est survenue. Veuillez réessayer.")
      setPageState("idle")
      return
    }

    setPageState("success")
  }

  const logo = (
    <div className="flex justify-center mb-8">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
          <span className="text-2xl font-bold text-primary-foreground">W</span>
        </div>
        <span className="text-2xl font-bold text-foreground">Wslni.ma</span>
      </Link>
    </div>
  )

  if (pageState === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          {logo}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Email envoyé !</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Un email de réinitialisation a été envoyé à{" "}
              <span className="font-medium text-foreground">{email}</span>.{" "}
              Vérifiez votre boîte mail et vos spams.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/connexion">
                <ArrowLeft className="h-4 w-4 me-2 rtl:rotate-180" />
                Retour à la connexion
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {logo}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="mb-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Mot de passe oublié ?</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Entrez votre adresse email et nous vous enverrons un lien de réinitialisation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null) }}
                required
                autoComplete="email"
              />
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
                  Envoi en cours…
                </>
              ) : (
                "Envoyer le lien"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link
              href="/connexion"
              className="text-primary font-medium hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
