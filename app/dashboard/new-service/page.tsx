"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, Clock,
  DollarSign, Eye, FileText, ImageIcon, Loader2,
  Plus, Settings, Sparkles, Upload, X,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { CATEGORY_GROUPS, getCategoryLabel } from "@/lib/categories"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

/* ─── Types ────────────────────────────────────────────────── */
interface Tier {
  name: string
  description: string
  price: string
  delivery_days: string
}

interface Draft {
  title: string
  categoryGroup: string
  subcategory: string
  description: string
  tiers: { basic: Tier; standard: Tier; premium: Tier }
  imageDataUrls: string[]
  requirements: string[]
}

type Errs = Record<string, string>

/* ─── Constants ─────────────────────────────────────────────── */
const LS_KEY    = "khadamat-new-service-v1"
const MAX_TITLE = 80
const MAX_DESC  = 1200
const MAX_IMGS  = 5

const BLANK: Draft = {
  title: "", categoryGroup: "", subcategory: "", description: "",
  tiers: {
    basic:    { name: "Basique",  description: "", price: "", delivery_days: "" },
    standard: { name: "Standard", description: "", price: "", delivery_days: "" },
    premium:  { name: "Premium",  description: "", price: "", delivery_days: "" },
  },
  imageDataUrls: [],
  requirements: [""],
}

const STEPS = [
  { id: 1, short: "Infos",     label: "Informations de base",  Icon: FileText   },
  { id: 2, short: "Tarifs",    label: "Tarification",          Icon: DollarSign },
  { id: 3, short: "Médias",    label: "Médias",                Icon: ImageIcon  },
  { id: 4, short: "Exigences", label: "Exigences client",      Icon: Settings   },
  { id: 5, short: "Aperçu",    label: "Aperçu & Publication",  Icon: Eye        },
]

const TIER_META = {
  basic:    { badge: "bg-slate-100 text-slate-700", border: "border-slate-200" },
  standard: { badge: "bg-red-50 text-red-700",      border: "border-red-200"   },
  premium:  { badge: "bg-amber-50 text-amber-700",  border: "border-amber-200" },
}

const TIER_NAMES: Record<string, string> = {
  basic: "Basique", standard: "Standard", premium: "Premium",
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function NewServicePage() {
  const router   = useRouter()
  const supabase = createClient()

  const [userId,      setUserId]      = useState<string | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [step,        setStep]        = useState(1)
  const [draft,       setDraft]       = useState<Draft>(BLANK)
  const [errors,      setErrors]      = useState<Errs>({})
  const [dragging,    setDragging]    = useState(false)
  const [publishing,  setPublishing]  = useState(false)
  const [pubError,    setPubError]    = useState("")
  const [done,        setDone]        = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  /* auth – middleware already protects /dashboard/:path* but we still need the user id */
  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.replace("/inscription?redirect=/dashboard/new-service")
        return
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, job_title, bio")
        .eq("id", data.user.id)
        .single()

      const isComplete = !!(
        profileData?.full_name?.trim() &&
        profileData?.job_title?.trim() &&
        profileData?.bio?.trim()
      )

      if (!isComplete) {
        toast.error("Complete ton profil avant de publier un service.")
        router.replace("/profil")
        return
      }

      setUserId(data.user.id)
      setLoadingUser(false)
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* restore draft from localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setDraft(d => ({ ...d, ...JSON.parse(raw) }))
    } catch {}
  }, [])

  /* persist draft on every change */
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(draft)) } catch {}
  }, [draft])

  /* helpers */
  const patch = (u: Partial<Draft>) => setDraft(d => ({ ...d, ...u }))

  const patchTier = (k: keyof Draft["tiers"], u: Partial<Tier>) =>
    setDraft(d => ({ ...d, tiers: { ...d.tiers, [k]: { ...d.tiers[k], ...u } } }))

  const clearErr = (...keys: string[]) =>
    setErrors(e => { const n = { ...e }; keys.forEach(k => delete n[k]); return n })

  /* ── Validation ── */
  function validate(s: number): Errs {
    const e: Errs = {}
    if (s === 1) {
      if (draft.title.trim().length < 10)
        e.title = draft.title.trim() ? "Au moins 10 caractères requis." : "Le titre est obligatoire."
      if (!draft.categoryGroup) e.categoryGroup = "Choisissez une catégorie principale."
      else if (!draft.subcategory) e.subcategory = "Choisissez une sous-catégorie."
      if (draft.description.trim().length < 50)
        e.description = draft.description.trim() ? "Au moins 50 caractères requis." : "La description est obligatoire."
    }
    if (s === 2) {
      ;(["basic", "standard", "premium"] as const).forEach(k => {
        const t = draft.tiers[k]
        if (!t.description.trim()) e[`${k}_desc`] = "Obligatoire."
        const p = parseFloat(t.price)
        if (!t.price || isNaN(p) || p <= 0) e[`${k}_price`] = "Prix invalide."
        const d = parseInt(t.delivery_days, 10)
        if (!t.delivery_days || isNaN(d) || d < 1) e[`${k}_days`] = "Délai invalide."
      })
    }
    return e
  }

  function goNext() {
    const e = validate(step)
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function goBack() {
    setErrors({})
    setStep(s => s - 1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  /* ── Images ── */
  function ingest(files: FileList | null) {
    if (!files) return
    const slots = MAX_IMGS - draft.imageDataUrls.length
    Array.from(files).slice(0, slots).forEach(f => {
      if (!f.type.startsWith("image/") || f.size > 5 * 1024 * 1024) return
      const reader = new FileReader()
      reader.onload = ev => {
        const url = ev.target?.result as string
        setDraft(d => ({
          ...d,
          imageDataUrls: [...d.imageDataUrls, url].slice(0, MAX_IMGS),
        }))
      }
      reader.readAsDataURL(f)
    })
  }

  function removeImg(i: number) {
    patch({ imageDataUrls: draft.imageDataUrls.filter((_, j) => j !== i) })
  }

  /* ── Requirements ── */
  function addReq()                        { patch({ requirements: [...draft.requirements, ""] }) }
  function removeReq(i: number)            { patch({ requirements: draft.requirements.filter((_, j) => j !== i) }) }
  function updateReq(i: number, v: string) { patch({ requirements: draft.requirements.map((r, j) => j === i ? v : r) }) }

  /* ── Publish ── */
  async function publish() {
    if (!userId) return
    setPublishing(true)
    setPubError("")

    const uploadedUrls: string[] = []
    for (const dataUrl of draft.imageDataUrls) {
      try {
        const res  = await fetch(dataUrl)
        const blob = await res.blob()
        const ext  = blob.type.split("/")[1] || "jpg"
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { data: up, error: upErr } = await supabase.storage
          .from("service-images")
          .upload(path, blob, { contentType: blob.type })
        if (!upErr && up) {
          const { data: pub } = supabase.storage.from("service-images").getPublicUrl(up.path)
          uploadedUrls.push(pub.publicUrl)
        }
      } catch {}
    }

    const { error } = await supabase.from("services").insert({
      user_id:        userId,
      title:          draft.title.trim(),
      description:    draft.description.trim(),
      category:       draft.subcategory,
      category_group: draft.categoryGroup,
      price:          parseFloat(draft.tiers.basic.price) || 0,
      delivery_days:  parseInt(draft.tiers.basic.delivery_days, 10) || 1,
      pricing_tiers:  draft.tiers,
      images:         uploadedUrls,
      requirements:   draft.requirements.filter(r => r.trim()),
      status:         "published",
    })

    setPublishing(false)
    if (error) {
      setPubError("Erreur lors de la publication : " + error.message)
    } else {
      localStorage.removeItem(LS_KEY)
      setDone(true)
    }
  }

  /* ─── Loading ─── */
  if (loadingUser) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        </div>
      </>
    )
  }

  /* ─── Success ─── */
  if (done) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
          <div className="text-center max-w-sm animate-fade-in-up">
            <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Service publié !</h2>
            <p className="text-gray-500 mb-8">
              Votre service est maintenant visible par les clients sur la marketplace.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
                <Link href="/dashboard">Tableau de bord</Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => { setDraft(BLANK); setDone(false); setStep(1) }}
              >
                Créer un autre service
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  const selGroup = CATEGORY_GROUPS.find(g => g.value === draft.categoryGroup)

  /* ─── Main render ─── */
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FAFAF8] py-10 px-4">
        <div className="mx-auto max-w-3xl">

          {/* ── Back link ── */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors animate-fade-in-up"
          >
            <ArrowLeft className="h-4 w-4" />
            Tableau de bord
          </Link>

          {/* ── Heading ── */}
          <div className="mb-8 animate-fade-in-up animation-delay-100">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Créer un service</h1>
            <p className="text-sm text-gray-500 mt-1">
              Présentez votre expertise et attirez vos premiers clients.
            </p>
          </div>

          {/* ── Stepper ── */}
          <nav className="mb-10 animate-fade-in-up animation-delay-175" aria-label="Étapes du formulaire">
            <ol className="flex items-start">
              {STEPS.map((s, idx) => {
                const isComplete = step > s.id
                const isCurrent  = step === s.id
                return (
                  <li key={s.id} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center shrink-0">
                      <button
                        aria-label={s.label}
                        aria-current={isCurrent ? "step" : undefined}
                        onClick={() => { if (isComplete) { setErrors({}); setStep(s.id) } }}
                        disabled={!isComplete}
                        className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300 ${
                          isComplete
                            ? "bg-red-600 border-red-600 text-white shadow-md shadow-red-200 cursor-pointer hover:bg-red-700"
                            : isCurrent
                            ? "bg-white border-red-600 text-red-600 shadow-sm"
                            : "bg-white border-gray-200 text-gray-400 cursor-default"
                        }`}
                      >
                        {isComplete ? <Check className="h-4 w-4" /> : s.id}
                      </button>
                      <span
                        className={`mt-1.5 text-[11px] font-medium hidden sm:block text-center leading-tight ${
                          isCurrent ? "text-red-600" : isComplete ? "text-gray-700" : "text-gray-400"
                        }`}
                      >
                        {s.short}
                      </span>
                    </div>

                    {idx < STEPS.length - 1 && (
                      <div className="flex-1 h-0.5 mx-1 mt-0 sm:-mt-4 relative overflow-hidden rounded-full">
                        <div className="absolute inset-0 bg-gray-200" />
                        <div
                          className="absolute inset-y-0 left-0 bg-red-600 transition-all duration-500"
                          style={{ width: isComplete ? "100%" : "0%" }}
                        />
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>

          {/* ── Step content (key triggers re-animation on step change) ── */}
          <div key={step} className="animate-fade-in-up">

            {/* ════ STEP 1: Informations de base ════ */}
            {step === 1 && (
              <div className="space-y-5">
                <Card title="Titre du service" sub="Rédigez un titre accrocheur qui résume votre service en une phrase.">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <Label htmlFor="svc-title">Titre</Label>
                      <span className={`text-xs tabular-nums transition-colors ${draft.title.length > MAX_TITLE * 0.85 ? "text-red-500" : "text-gray-400"}`}>
                        {draft.title.length}/{MAX_TITLE}
                      </span>
                    </div>
                    <Input
                      id="svc-title"
                      maxLength={MAX_TITLE}
                      placeholder="Ex : Je crée votre identité visuelle complète en 5 jours"
                      value={draft.title}
                      onChange={e => { patch({ title: e.target.value }); clearErr("title") }}
                      className={errors.title ? "border-red-400 focus-visible:ring-red-300" : ""}
                    />
                    {errors.title && <ErrMsg msg={errors.title} />}
                  </div>
                </Card>

                <Card title="Catégorie" sub="Aidez les clients à trouver votre service dans la bonne rubrique.">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Catégorie principale</Label>
                      <StyledSelect
                        value={draft.categoryGroup}
                        hasError={!!errors.categoryGroup}
                        onChange={v => { patch({ categoryGroup: v, subcategory: "" }); clearErr("categoryGroup", "subcategory") }}
                        placeholder="— Choisir —"
                        options={CATEGORY_GROUPS.map(g => ({ value: g.value, label: g.label }))}
                      />
                      {errors.categoryGroup && <ErrMsg msg={errors.categoryGroup} />}
                    </div>

                    <div className={`space-y-1.5 transition-opacity duration-300 ${draft.categoryGroup ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
                      <Label>Sous-catégorie</Label>
                      <StyledSelect
                        value={draft.subcategory}
                        hasError={!!errors.subcategory}
                        onChange={v => { patch({ subcategory: v }); clearErr("subcategory") }}
                        placeholder="— Choisir —"
                        options={selGroup?.subcategories.map(s => ({ value: s.value, label: s.label })) ?? []}
                      />
                      {errors.subcategory && <ErrMsg msg={errors.subcategory} />}
                    </div>
                  </div>
                </Card>

                <Card title="Description" sub="Décrivez votre service en détail : expérience, processus, livrables, garanties.">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <Label htmlFor="svc-desc">Description</Label>
                      <span className={`text-xs tabular-nums transition-colors ${draft.description.length > MAX_DESC * 0.9 ? "text-red-500" : "text-gray-400"}`}>
                        {draft.description.length}/{MAX_DESC}
                      </span>
                    </div>
                    <Textarea
                      id="svc-desc"
                      rows={8}
                      maxLength={MAX_DESC}
                      placeholder="Décrivez votre service avec précision. Parlez de votre expertise, de ce que vous livrez, de votre méthode de travail et des résultats attendus…"
                      value={draft.description}
                      onChange={e => { patch({ description: e.target.value }); clearErr("description") }}
                      className={`resize-none ${errors.description ? "border-red-400 focus-visible:ring-red-300" : ""}`}
                    />
                    {errors.description && <ErrMsg msg={errors.description} />}
                  </div>
                </Card>
              </div>
            )}

            {/* ════ STEP 2: Tarification ════ */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Tarification</h2>
                  <p className="text-sm text-gray-500">Proposez trois formules adaptées à différents besoins et budgets.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {(["basic", "standard", "premium"] as const).map(key => {
                    const t = draft.tiers[key]
                    const m = TIER_META[key]
                    return (
                      <div
                        key={key}
                        className={`rounded-2xl border-2 ${m.border} bg-white p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow`}
                      >
                        <span className={`self-start px-2.5 py-1 rounded-full text-xs font-bold ${m.badge}`}>
                          {TIER_NAMES[key]}
                        </span>

                        <TierField label="Nom de la formule">
                          <Input
                            value={t.name}
                            placeholder={TIER_NAMES[key]}
                            onChange={e => patchTier(key, { name: e.target.value })}
                            className="text-sm"
                          />
                        </TierField>

                        <TierField label="Ce qui est inclus" error={errors[`${key}_desc`]}>
                          <Textarea
                            rows={3}
                            value={t.description}
                            placeholder="Listez ce qui est compris dans cette formule…"
                            onChange={e => { patchTier(key, { description: e.target.value }); clearErr(`${key}_desc`) }}
                            className={`text-sm resize-none ${errors[`${key}_desc`] ? "border-red-400" : ""}`}
                          />
                        </TierField>

                        <TierField label="Prix (DH)" error={errors[`${key}_price`]}>
                          <div className="relative">
                            <Input
                              type="number" min="1" value={t.price} placeholder="500"
                              onChange={e => { patchTier(key, { price: e.target.value }); clearErr(`${key}_price`) }}
                              className={`pr-10 text-sm ${errors[`${key}_price`] ? "border-red-400" : ""}`}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">DH</span>
                          </div>
                        </TierField>

                        <TierField label="Délai de livraison" error={errors[`${key}_days`]}>
                          <div className="relative">
                            <Input
                              type="number" min="1" value={t.delivery_days} placeholder="3"
                              onChange={e => { patchTier(key, { delivery_days: e.target.value }); clearErr(`${key}_days`) }}
                              className={`pr-14 text-sm ${errors[`${key}_days`] ? "border-red-400" : ""}`}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">jours</span>
                          </div>
                        </TierField>
                      </div>
                    )
                  })}
                </div>

                <p className="text-xs text-center text-gray-400">
                  * Le prix de la formule Basique sera le prix d&apos;affichage principal du service.
                </p>
              </div>
            )}

            {/* ════ STEP 3: Médias ════ */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Médias</h2>
                  <p className="text-sm text-gray-500">
                    Ajoutez jusqu&apos;à {MAX_IMGS} images pour présenter votre travail visuellement.
                  </p>
                </div>

                {/* Drop zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => { e.preventDefault(); setDragging(false); ingest(e.dataTransfer.files) }}
                  onClick={() => draft.imageDataUrls.length < MAX_IMGS && fileRef.current?.click()}
                  className={`rounded-2xl border-2 border-dashed p-12 flex flex-col items-center gap-4 transition-all duration-200 ${
                    dragging
                      ? "border-red-400 bg-red-50 cursor-copy"
                      : draft.imageDataUrls.length >= MAX_IMGS
                      ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                      : "border-gray-300 bg-white hover:border-red-400 hover:bg-red-50/20 cursor-pointer"
                  }`}
                >
                  <div className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors ${dragging ? "bg-red-100" : "bg-gray-100"}`}>
                    <Upload className={`h-6 w-6 transition-colors ${dragging ? "text-red-600" : "text-gray-400"}`} />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-700 text-sm">
                      {draft.imageDataUrls.length >= MAX_IMGS
                        ? "Limite atteinte — supprimez une image pour en ajouter"
                        : dragging
                        ? "Relâchez pour ajouter les images"
                        : "Glissez vos images ici, ou cliquez pour parcourir"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG, WEBP · Max 5 Mo par image · {draft.imageDataUrls.length}/{MAX_IMGS} images
                    </p>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => ingest(e.target.files)}
                  />
                </div>

                {/* Image thumbnails */}
                {draft.imageDataUrls.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {draft.imageDataUrls.map((url, i) => (
                      <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-150 flex items-center justify-center">
                          <button
                            onClick={e => { e.stopPropagation(); removeImg(i) }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-full bg-white shadow-md flex items-center justify-center text-red-600 hover:bg-red-50"
                            aria-label="Supprimer cette image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        {i === 0 && (
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white leading-none">
                            Principale
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                  <p className="text-sm font-medium text-amber-800 mb-1.5">Conseils pour de meilleures images</p>
                  <ul className="space-y-1 text-xs text-amber-700 list-disc list-inside">
                    <li>Résolution minimale recommandée : 800 × 600 px</li>
                    <li>La première image sera utilisée comme miniature principale</li>
                    <li>Montrez des exemples concrets de vos réalisations</li>
                    <li>Privilégiez des images lumineuses, nettes et professionnelles</li>
                  </ul>
                </div>
              </div>
            )}

            {/* ════ STEP 4: Exigences client ════ */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Exigences client</h2>
                  <p className="text-sm text-gray-500">
                    Précisez les informations dont vous avez besoin pour démarrer le projet.
                  </p>
                </div>

                <Card
                  title="Questions au client"
                  sub="Ces questions seront posées automatiquement lors de chaque commande."
                >
                  <div className="space-y-3">
                    {draft.requirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-2 animate-fade-in-up">
                        <span className="w-6 shrink-0 text-sm font-medium text-gray-400 text-right">{i + 1}.</span>
                        <Input
                          value={req}
                          onChange={e => updateReq(i, e.target.value)}
                          placeholder={
                            i === 0 ? "Ex : Envoyez-moi votre logo en haute résolution"
                          : i === 1 ? "Ex : Décrivez votre projet en quelques lignes"
                          :           "Ex : Avez-vous des exemples ou références ?"
                          }
                          className="flex-1 text-sm"
                        />
                        {draft.requirements.length > 1 && (
                          <button
                            onClick={() => removeReq(i)}
                            aria-label="Supprimer cette question"
                            className="shrink-0 h-9 w-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={addReq}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                  >
                    <span className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                      <Plus className="h-3.5 w-3.5" />
                    </span>
                    Ajouter une question
                  </button>
                </Card>

                <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                  <p className="text-sm font-medium text-blue-800 mb-1.5">Exemples d&apos;exigences efficaces</p>
                  <ul className="space-y-1 text-xs text-blue-700 list-disc list-inside">
                    <li>Envoyez-moi votre charte graphique (couleurs, polices, logo)</li>
                    <li>Quel est le ton souhaité ? (professionnel, dynamique, luxueux…)</li>
                    <li>Fournissez les textes et contenus à intégrer</li>
                    <li>Indiquez une date limite si vous en avez une</li>
                  </ul>
                </div>
              </div>
            )}

            {/* ════ STEP 5: Aperçu & Publication ════ */}
            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Aperçu & Publication</h2>
                  <p className="text-sm text-gray-500">
                    Vérifiez votre service tel qu&apos;il apparaîtra aux clients, puis publiez.
                  </p>
                </div>

                {/* Service preview card */}
                <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                  {draft.imageDataUrls[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={draft.imageDataUrls[0]} alt="Aperçu du service" className="w-full h-60 object-cover" />
                  ) : (
                    <div className="w-full h-60 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
                      <ImageIcon className="h-14 w-14 text-stone-300" />
                    </div>
                  )}

                  <div className="p-6">
                    {draft.subcategory && (
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100 mb-3">
                        {getCategoryLabel(draft.subcategory)}
                      </span>
                    )}

                    <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug">
                      {draft.title || <em className="text-gray-400 font-normal not-italic">Titre non renseigné</em>}
                    </h3>

                    <p className="text-sm text-gray-600 leading-relaxed mb-6 line-clamp-4">
                      {draft.description || <em className="text-gray-400 not-italic">Description non renseignée</em>}
                    </p>

                    {/* Pricing tiers */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      {(["basic", "standard", "premium"] as const).map(k => {
                        const t = draft.tiers[k]
                        const m = TIER_META[k]
                        return (
                          <div key={k} className={`rounded-xl border ${m.border} p-3 text-center`}>
                            <div className={`text-[11px] font-bold mb-1 ${m.badge}`}>
                              {t.name || TIER_NAMES[k]}
                            </div>
                            <div className="text-base font-bold text-gray-900">
                              {t.price ? `${t.price} DH` : "—"}
                            </div>
                            <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mt-0.5">
                              <Clock className="h-3 w-3" />
                              <span>{t.delivery_days ? `${t.delivery_days}j` : "—"}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Requirements */}
                    {draft.requirements.filter(r => r.trim()).length > 0 && (
                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Informations requises du client</p>
                        <ul className="space-y-1.5">
                          {draft.requirements.filter(r => r.trim()).map((r, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                              <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Additional image strip */}
                    {draft.imageDataUrls.length > 1 && (
                      <div className="border-t border-gray-100 pt-4 mt-4 flex gap-2 overflow-x-auto pb-1">
                        {draft.imageDataUrls.map((url, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={i}
                            src={url}
                            alt=""
                            className="h-16 w-24 object-cover rounded-lg shrink-0 border border-gray-100"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Checklist summary */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Récapitulatif</p>
                  <div className="space-y-2.5">
                    {[
                      {
                        label: "Titre",
                        ok:    draft.title.trim().length >= 10,
                        val:   draft.title || "—",
                      },
                      {
                        label: "Catégorie",
                        ok:    !!draft.subcategory,
                        val:   draft.subcategory ? getCategoryLabel(draft.subcategory) : "—",
                      },
                      {
                        label: "Description",
                        ok:    draft.description.trim().length >= 50,
                        val:   `${draft.description.trim().length} car.`,
                      },
                      {
                        label: "Tarification",
                        ok:    !!(draft.tiers.basic.price && draft.tiers.standard.price && draft.tiers.premium.price),
                        val:   `${draft.tiers.basic.price || "—"} / ${draft.tiers.standard.price || "—"} / ${draft.tiers.premium.price || "—"} DH`,
                      },
                      {
                        label: "Médias",
                        ok:    draft.imageDataUrls.length > 0,
                        val:   `${draft.imageDataUrls.length} image(s)`,
                      },
                      {
                        label: "Exigences",
                        ok:    true,
                        val:   `${draft.requirements.filter(r => r.trim()).length} question(s)`,
                      },
                    ].map(({ label, ok, val }) => (
                      <div key={label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${ok ? "bg-emerald-100" : "bg-amber-100"}`}>
                            {ok
                              ? <Check className="h-3 w-3 text-emerald-600" />
                              : <span className="text-[10px] font-bold text-amber-600">!</span>
                            }
                          </div>
                          <span className="text-sm text-gray-700">{label}</span>
                        </div>
                        <span className="text-xs text-gray-400 max-w-[180px] truncate text-right">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {pubError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {pubError}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Navigation buttons ── */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={goBack}
              className={step <= 1 ? "invisible pointer-events-none" : ""}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Précédent
            </Button>

            {step < 5 ? (
              <Button
                onClick={goNext}
                className="bg-red-600 hover:bg-red-700 text-white active:scale-[0.97] transition-transform"
              >
                Suivant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={publish}
                disabled={publishing}
                className="bg-red-600 hover:bg-red-700 text-white active:scale-[0.97] transition-transform px-8 gap-2"
              >
                {publishing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publication en cours…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Publier mon service
                  </>
                )}
              </Button>
            )}
          </div>

        </div>
      </div>
    </>
  )
}

/* ─── Shared micro-components ──────────────────────────────── */

function Card({
  title, sub, children,
}: {
  title: string
  sub?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        {sub && <p className="text-sm text-gray-500 mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  )
}

function TierField({
  label, error, children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-gray-500">{label}</Label>
      {children}
      {error && <ErrMsg msg={error} />}
    </div>
  )
}

function ErrMsg({ msg }: { msg: string }) {
  return <p className="text-xs text-red-600">{msg}</p>
}

function StyledSelect({
  value, onChange, placeholder, options, hasError,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  options: { value: string; label: string }[]
  hasError?: boolean
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full h-10 rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors ${
        hasError ? "border-red-400" : "border-input hover:border-gray-300"
      }`}
    >
      <option value="">{placeholder}</option>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
