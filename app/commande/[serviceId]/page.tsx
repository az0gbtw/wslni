"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  Loader2, Clock, ArrowLeft, ShieldCheck, FileText,
} from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getCategoryLabel, CATEGORY_COLORS } from "@/lib/categories"
import { useLanguage } from "@/lib/language-context"
import { formatPrice } from "@/lib/utils"

interface ServiceRow {
  id: string
  title: string
  description: string
  category: string
  price: number
  delivery_days: number
  user_id: string
  status: string
  requirements: string[] | null
}

interface Profile {
  full_name: string | null
  avatar_url: string | null
  job_title: string | null
}

interface ServiceWithProfile extends ServiceRow {
  profiles: Profile | null
}

type PageStep = "loading" | "form" | "submitting" | "error"

export default function CommandePage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const serviceId = params.serviceId as string
  const { lang } = useLanguage()

  const tierKey = searchParams.get("tier") as "basic" | "standard" | "premium" | null
  const tierPrice = searchParams.get("price")
  const tierDeliveryDays = searchParams.get("delivery_days")

  const TIER_LABELS: Record<string, string> = { basic: "Basique", standard: "Standard", premium: "Premium" }

  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [service, setService] = useState<ServiceWithProfile | null>(null)
  const [step, setStep] = useState<PageStep>("loading")
  const [errorMsg, setErrorMsg] = useState("")
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<number, boolean>>({})

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace(`/inscription?redirect=/commande/${serviceId}`)
        return
      }
      setUser(user)

      const { data: svcData, error: svcError } = await supabase
        .from("services")
        .select("*")
        .eq("id", serviceId)
        .single()

      if (svcError || !svcData) {
        setErrorMsg("Service introuvable ou n'est plus disponible.")
        setStep("error")
        return
      }

      const svc = svcData as ServiceRow

      if (svc.status !== "published") {
        setErrorMsg("Service introuvable ou n'est plus disponible.")
        setStep("error")
        return
      }

      if (svc.user_id === user.id) {
        setErrorMsg("Vous ne pouvez pas commander votre propre service.")
        setStep("error")
        return
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, job_title")
        .eq("id", svc.user_id)
        .single()

      setService({ ...svc, profiles: profileData ?? null })
      setStep("form")
    })
  }, [serviceId, router])

  function handleAnswerChange(index: number, value: string) {
    setAnswers(prev => ({ ...prev, [index]: value }))
    if (value.trim()) {
      setFieldErrors(prev => {
        const next = { ...prev }
        delete next[index]
        return next
      })
    }
  }

  async function handleConfirm() {
    if (!user || !service) return

    const requirements = Array.isArray(service.requirements)
      ? service.requirements.filter(Boolean)
      : []

    const errors: Record<number, boolean> = {}
    requirements.forEach((_, i) => {
      if (!answers[i]?.trim()) errors[i] = true
    })
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setStep("submitting")
    setErrorMsg("")

    const requirementsAnswers = requirements.reduce<Record<string, string>>((acc, q, i) => {
      acc[q] = answers[i] ?? ""
      return acc
    }, {})

    const supabase = createClient()

    const effectivePrice = tierPrice ? Number(tierPrice) : service.price

    const baseOrder = {
      service_id: service.id,
      client_id: user.id,
      freelancer_id: service.user_id,
      service_title: service.title,
      price: effectivePrice,
      status: "en_attente",
    }

    let insertError = null

    if (requirements.length > 0) {
      const { error } = await supabase.from("orders").insert({
        ...baseOrder,
        requirements_answers: requirementsAnswers,
      })
      if (error) {
        // Column may not exist yet — fall back to insert without it
        if (
          error.code === "42703" ||
          error.message?.toLowerCase().includes("requirements_answers")
        ) {
          const { error: fallbackErr } = await supabase.from("orders").insert(baseOrder)
          insertError = fallbackErr ?? null
        } else {
          insertError = error
        }
      }
    } else {
      const { error } = await supabase.from("orders").insert(baseOrder)
      insertError = error ?? null
    }

    if (insertError) {
      setErrorMsg("Erreur serveur. Veuillez réessayer.")
      setStep("form")
      return
    }

    const clientName =
      (user.user_metadata?.full_name as string | undefined) ??
      user.email?.split("@")[0] ??
      "Client"

    fetch("/api/emails/new-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        freelancerId: service.user_id,
        clientName,
        serviceTitle: service.title,
        price: effectivePrice,
      }),
    }).catch(() => {})

    router.push("/commande/success")
  }

  if (step === "loading") {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    )
  }

  if (step === "error") {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <p className="text-lg font-semibold text-foreground mb-2">{errorMsg}</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/services">
                <ArrowLeft className={`h-4 w-4 me-2 ${lang === "ar" ? "rotate-180" : ""}`} />
                Retour aux services
              </Link>
            </Button>
          </div>
        </div>
      </>
    )
  }

  if (!service) return null

  const profile = service.profiles
  const requirements = Array.isArray(service.requirements)
    ? service.requirements.filter(Boolean)
    : []
  const categoryColor = CATEGORY_COLORS[service.category] ?? "bg-gray-100 text-gray-700"
  const categoryLabel = getCategoryLabel(service.category, lang)
  const ini = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?"

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-muted/30 py-10 px-4">
        <div className="max-w-xl mx-auto">

          <Link
            href={`/services/${serviceId}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className={`h-4 w-4 ${lang === "ar" ? "rotate-180" : ""}`} />
            Retour au service
          </Link>

          <h1 className="text-2xl font-black text-foreground mb-6">
            Résumé de la commande
          </h1>

          {/* Service summary card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm mb-4">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColor}`}>
                {categoryLabel}
              </span>
              {tierKey && (
                <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  {TIER_LABELS[tierKey] ?? tierKey}
                </span>
              )}
            </div>

            <h2 className="text-lg font-bold text-foreground mb-1 leading-snug">
              {service.title}
            </h2>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed line-clamp-2">
              {service.description}
            </p>

            {/* Freelancer info */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 mb-5">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name ?? "Freelance"}
                  className="h-10 w-10 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">{ini}</span>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {profile?.full_name ?? "Freelance"}
                </p>
                {profile?.job_title && (
                  <p className="text-xs text-muted-foreground">{profile.job_title}</p>
                )}
              </div>
            </div>

            {/* Price + delivery */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Délai — {tierDeliveryDays ? Number(tierDeliveryDays) : service.delivery_days} jour(s)
                </span>
              </div>
              <div className="text-end">
                <span className="text-2xl font-black text-primary">
                  {formatPrice(tierPrice ? Number(tierPrice) : service.price, lang)}
                </span>
                <span className="text-sm font-semibold text-muted-foreground ms-1">MAD</span>
              </div>
            </div>
          </div>

          {/* Requirements form */}
          {requirements.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm mb-4">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Informations requises
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Veuillez répondre à toutes les questions du freelance pour démarrer votre commande.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {requirements.map((question, i) => (
                  <div key={i}>
                    <Label
                      htmlFor={`req-${i}`}
                      className="text-sm font-medium text-foreground mb-1.5 block"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold inline-flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        {question}
                      </span>
                    </Label>
                    <Textarea
                      id={`req-${i}`}
                      value={answers[i] ?? ""}
                      onChange={(e) => handleAnswerChange(i, e.target.value)}
                      placeholder="Votre réponse..."
                      rows={3}
                      className={`resize-none text-sm transition-colors ${
                        fieldErrors[i]
                          ? "border-destructive focus-visible:ring-destructive/30"
                          : ""
                      }`}
                    />
                    {fieldErrors[i] && (
                      <p className="text-xs text-destructive mt-1">Ce champ est requis.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security notice */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6 px-1">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Paiement simulé — aucune donnée bancaire requise.</span>
          </div>

          {/* Confirm button */}
          <Button
            onClick={handleConfirm}
            disabled={step === "submitting"}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base h-12 rounded-xl"
          >
            {step === "submitting" ? (
              <>
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              <>Confirmer la commande — {formatPrice(tierPrice ? Number(tierPrice) : service.price, lang)} MAD</>
            )}
          </Button>

          {errorMsg && step === "form" && (
            <p className="text-sm text-destructive text-center mt-3">{errorMsg}</p>
          )}
        </div>
      </div>
    </>
  )
}
