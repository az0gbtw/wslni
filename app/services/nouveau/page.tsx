"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, Loader2, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { CATEGORIES } from "@/lib/categories"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface FormState {
  title: string
  description: string
  category: string
  price: string
  delivery_days: string
}

const INITIAL_FORM: FormState = {
  title: "",
  description: "",
  category: "",
  price: "",
  delivery_days: "",
}

export default function NouveauServicePage() {
  const router = useRouter()
  const supabase = createClient()

  const [userId, setUserId] = useState<string | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState("")

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/connexion?redirect=/services/nouveau")
      } else {
        setUserId(data.user.id)
      }
      setLoadingUser(false)
    })
  }, [])

  function validate(): boolean {
    const newErrors: Partial<FormState> = {}
    if (!form.title.trim()) newErrors.title = "Le titre est obligatoire."
    else if (form.title.trim().length < 5) newErrors.title = "Le titre doit contenir au moins 5 caractères."
    if (!form.description.trim()) newErrors.description = "La description est obligatoire."
    else if (form.description.trim().length < 20) newErrors.description = "La description doit contenir au moins 20 caractères."
    if (!form.category) newErrors.category = "Veuillez choisir une catégorie."
    const price = parseFloat(form.price)
    if (!form.price || isNaN(price) || price <= 0) newErrors.price = "Entrez un prix valide (> 0)."
    const days = parseInt(form.delivery_days, 10)
    if (!form.delivery_days || isNaN(days) || days <= 0) newErrors.delivery_days = "Entrez un délai valide (≥ 1 jour)."
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate() || !userId) return
    setSubmitting(true)
    setServerError("")

    const { error } = await supabase.from("services").insert({
      user_id: userId,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      price: parseFloat(form.price),
      delivery_days: parseInt(form.delivery_days, 10),
      status: "published",
    })

    setSubmitting(false)
    if (error) {
      setServerError("Une erreur est survenue. Veuillez réessayer.")
    } else {
      setSuccess(true)
    }
  }

  if (loadingUser) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    )
  }

  if (success) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">Service publié !</h1>
            <p className="text-muted-foreground mb-8">
              Votre service est maintenant visible par tous les clients sur la marketplace.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/services">Voir les services</Link>
              </Button>
              <Button variant="outline" onClick={() => { setForm(INITIAL_FORM); setSuccess(false) }}>
                Publier un autre service
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="mx-auto max-w-2xl">
          {/* Back link */}
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux services
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Proposer un service</h1>
            <p className="text-muted-foreground">
              Décrivez votre service avec précision pour attirer les bons clients.
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} noValidate className="space-y-6">

              {/* Titre */}
              <div className="space-y-2">
                <Label htmlFor="title">Titre du service</Label>
                <Input
                  id="title"
                  placeholder="Ex : Je crée votre logo professionnel en 48h"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez en détail ce que vous proposez, votre expérience, ce qui est inclus dans la prestation…"
                  rows={5}
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className={errors.description ? "border-destructive" : ""}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {form.description.length} / 20 min.
                </p>
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>

              {/* Catégorie */}
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    errors.category ? "border-destructive" : "border-input"
                  }`}
                >
                  <option value="">— Choisissez une catégorie —</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
              </div>

              {/* Prix & Délai */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix (MAD)</Label>
                  <div className="relative">
                    <Input
                      id="price"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="500"
                      value={form.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      className={`pr-14 ${errors.price ? "border-destructive" : ""}`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                      MAD
                    </span>
                  </div>
                  {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery_days">Délai de livraison</Label>
                  <div className="relative">
                    <Input
                      id="delivery_days"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="3"
                      value={form.delivery_days}
                      onChange={(e) => handleChange("delivery_days", e.target.value)}
                      className={`pr-16 ${errors.delivery_days ? "border-destructive" : ""}`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                      jours
                    </span>
                  </div>
                  {errors.delivery_days && <p className="text-sm text-destructive">{errors.delivery_days}</p>}
                </div>
              </div>

              {/* Server error */}
              {serverError && (
                <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {serverError}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitting ? "Publication en cours…" : "Publier le service"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
