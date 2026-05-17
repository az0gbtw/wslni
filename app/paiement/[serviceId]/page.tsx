"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import {
  Loader2, CheckCircle2, Clock, ArrowLeft, ShieldCheck,
} from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { getCategoryLabel, CATEGORY_COLORS } from "@/lib/categories"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { formatPrice } from "@/lib/utils"

interface ServiceWithProfile {
  id: string
  title: string
  description: string
  category: string
  price: number
  delivery_days: number
  user_id: string
  profiles: {
    full_name: string | null
    avatar_url: string | null
    job_title: string | null
  } | null
}

type Step = "loading" | "details" | "confirming" | "success" | "error"

export default function PaiementPage() {
  const router = useRouter()
  const params = useParams()
  const serviceId = params.serviceId as string
  const { lang } = useLanguage()
  const t = translations[lang].paiement

  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [service, setService] = useState<ServiceWithProfile | null>(null)
  const [step, setStep] = useState<Step>("loading")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace(`/connexion?redirect=/paiement/${serviceId}`)
        return
      }
      setUser(user)

      const { data, error } = await supabase
        .from("services")
        .select(`*, profiles (full_name, avatar_url, job_title)`)
        .eq("id", serviceId)
        .eq("status", "published")
        .single()

      if (error || !data) {
        setErrorMsg(t.errorMessage)
        setStep("error")
        return
      }

      const svc = data as ServiceWithProfile
      if (svc.user_id === user.id) {
        setErrorMsg(t.ownServiceError)
        setStep("error")
        return
      }

      setService(svc)
      setStep("details")
    })
  }, [serviceId, router])

  async function handleConfirm() {
    if (!user || !service) return
    setStep("confirming")

    const supabase = createClient()
    const { error } = await supabase.from("orders").insert({
      service_id: service.id,
      client_id: user.id,
      freelancer_id: service.user_id,
      service_title: service.title,
      price: service.price,
      status: "en_attente",
    })

    if (error) {
      setErrorMsg(t.serverError)
      setStep("details")
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
        price: service.price,
      }),
    }).catch(() => {})

    setStep("success")
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
                {t.backToServices}
              </Link>
            </Button>
          </div>
        </div>
      </>
    )
  }

  if (step === "success" && service) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md w-full">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-black text-foreground mb-2">{t.successTitle}</h1>
            <p className="text-muted-foreground mb-2">
              <span className="font-semibold text-foreground">{service.title}</span>
            </p>
            <p className="text-sm text-muted-foreground mb-8">{t.successMessage}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline">
                <Link href="/services">
                  <ArrowLeft className={`h-4 w-4 me-2 ${lang === "ar" ? "rotate-180" : ""}`} />
                  {t.backToServices}
                </Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/dashboard">{t.goToOrders}</Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!service) return null

  const profile = service.profiles
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
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className={`h-4 w-4 ${lang === "ar" ? "rotate-180" : ""}`} />
            {t.backToServices}
          </Link>

          <h1 className="text-2xl font-black text-foreground mb-6">{t.orderSummary}</h1>

          {/* Service card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm mb-4">
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium mb-3 ${categoryColor}`}>
              {categoryLabel}
            </span>

            <h2 className="text-lg font-bold text-foreground mb-2 leading-snug">{service.title}</h2>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{service.description}</p>

            {/* Freelancer info */}
            <Link
              href={`/profil/${service.user_id}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 mb-5 hover:bg-muted/80 transition-colors"
            >
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name ?? t.freelancer}
                  className="h-10 w-10 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">{ini}</span>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">{profile?.full_name ?? t.freelancer}</p>
                {profile?.job_title && (
                  <p className="text-xs text-muted-foreground">{profile.job_title}</p>
                )}
              </div>
            </Link>

            {/* Price + delivery */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{t.delivery} — {t.days(service.delivery_days)}</span>
              </div>
              <div className="text-end">
                <span className="text-2xl font-black text-primary">
                  {formatPrice(service.price, lang)}
                </span>
                <span className="text-sm font-semibold text-muted-foreground ms-1">MAD</span>
              </div>
            </div>
          </div>

          {/* Security notice */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6 px-1">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>{t.securePayment}</span>
          </div>

          {/* Confirm button */}
          <Button
            onClick={handleConfirm}
            disabled={step === "confirming"}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base h-12 rounded-xl"
          >
            {step === "confirming" ? (
              <>
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
                {t.processing}
              </>
            ) : (
              <>{t.confirmOrder} — {formatPrice(service.price, lang)} MAD</>
            )}
          </Button>

          {errorMsg && step === "details" && (
            <p className="text-sm text-destructive text-center mt-3">{errorMsg}</p>
          )}
        </div>
      </div>
    </>
  )
}
