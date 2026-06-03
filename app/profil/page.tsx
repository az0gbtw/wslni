"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Camera, Edit2, Plus, X, ExternalLink,
  Loader2, Save, Briefcase, Tag, Calendar, MessageSquare, CheckCircle2,
  ShieldCheck, ShieldAlert, Shield, Upload,
} from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { formatPrice } from "@/lib/utils"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"

type CinStatus = "none" | "pending" | "verified" | "rejected"

interface Profile {
  id: string
  full_name: string | null
  job_title: string | null
  bio: string | null
  skills: string[]
  hourly_rate: number | null
  portfolio_links: string[]
  avatar_url: string | null
  updated_at?: string | null
  cin_status?: CinStatus
  cin_uploaded_at?: string | null
}

function ZelligeCover() {
  return (
    <div className="h-52 relative overflow-hidden bg-primary">
      <svg className="absolute inset-0 w-full h-full" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="zellige-own" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M24 2 L46 24 L24 46 L2 24 Z" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
            <path d="M24 12 L36 24 L24 36 L12 24 Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.13)" strokeWidth="1" />
            <line x1="24" y1="2" x2="24" y2="12" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
            <line x1="46" y1="24" x2="36" y2="24" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
            <line x1="24" y1="46" x2="24" y2="36" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
            <line x1="2" y1="24" x2="12" y2="24" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
            <circle cx="24" cy="24" r="2.5" fill="rgba(255,255,255,0.18)" />
            <circle cx="0" cy="0" r="2" fill="rgba(255,255,255,0.14)" />
            <circle cx="48" cy="0" r="2" fill="rgba(255,255,255,0.14)" />
            <circle cx="0" cy="48" r="2" fill="rgba(255,255,255,0.14)" />
            <circle cx="48" cy="48" r="2" fill="rgba(255,255,255,0.14)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#zellige-own)" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/15" />
    </div>
  )
}

type FormData = Omit<Profile, "id">

const EMPTY: FormData = {
  full_name: null, job_title: null, bio: null,
  skills: [], hourly_rate: null, portfolio_links: [], avatar_url: null,
}

function initials(name: string | null, email?: string | null) {
  const src = name || email?.split("@")[0] || "?"
  return src.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

function formFromProfile(p: Profile): FormData {
  return {
    full_name: p.full_name, job_title: p.job_title, bio: p.bio,
    skills: p.skills ?? [], hourly_rate: p.hourly_rate,
    portfolio_links: p.portfolio_links ?? [], avatar_url: p.avatar_url,
  }
}

export default function ProfilPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const t = translations[lang].profil

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)

  const [form, setForm] = useState<FormData>(EMPTY)
  const [skillInput, setSkillInput] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [cinUploading, setCinUploading] = useState(false)
  const [cinError, setCinError] = useState<string | null>(null)
  const cinRef = useRef<HTMLInputElement>(null)

  function memberSince(ts?: string | null) {
    if (!ts) return "—"
    return new Date(ts).toLocaleDateString(lang === "ar" ? "ar-MA-u-nu-arab" : "fr-FR", { month: "long", year: "numeric" })
  }

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace("/connexion"); return }
      setUser(user)
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (error) console.error("[profil] profile load:", error.message)
      const p: Profile = data ?? { id: user.id, ...EMPTY, full_name: (user.user_metadata?.full_name as string) ?? null }
      setProfile(p)
      setForm(formFromProfile(p))
      setLoading(false)
    })
  }, [router])

  function handleSheetChange(open: boolean) {
    setEditOpen(open)
    if (!open && profile) { setForm(formFromProfile(profile)); setSaveError(null) }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split(".").pop()
    const path = `${user.id}/avatar.${ext}`
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path)
      setForm((f) => ({ ...f, avatar_url: `${publicUrl}?t=${Date.now()}` }))
    } else {
      console.error("[profil] avatar upload:", error.message)
      toast.error("Impossible de télécharger la photo. Réessayez.")
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ""
  }

  function addSkill() {
    const s = skillInput.trim()
    if (!s || form.skills.includes(s)) { setSkillInput(""); return }
    setForm((f) => ({ ...f, skills: [...f.skills, s] }))
    setSkillInput("")
  }

  async function handleCinUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    if (file.size > 5 * 1024 * 1024) {
      setCinError("Le fichier dépasse 5 Mo.")
      return
    }
    setCinError(null)
    setCinUploading(true)
    const supabase = createClient()
    const { error: storageError } = await supabase.storage
      .from("cin-uploads")
      .upload(`${user.id}/cin.jpg`, file, { upsert: true, contentType: file.type })

    if (storageError) {
      setCinError("Erreur lors de l'envoi. Veuillez réessayer.")
      setCinUploading(false)
      if (cinRef.current) cinRef.current.value = ""
      return
    }

    const res = await fetch("/api/cin", { method: "POST" })
    if (!res.ok) {
      setCinError("Erreur lors de la mise à jour du statut.")
      setCinUploading(false)
      if (cinRef.current) cinRef.current.value = ""
      return
    }

    setProfile((p) => p ? { ...p, cin_status: "pending", cin_uploaded_at: new Date().toISOString() } : p)
    setCinUploading(false)
    if (cinRef.current) cinRef.current.value = ""
  }

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setSaveError(null)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...form, portfolio_links: form.portfolio_links.filter(Boolean) }, { onConflict: "id" })
      .select().single()

    if (error || !data) {
      setSaveError(t.sheet.saveError)
      setSaving(false)
      return
    }
    setProfile(data)
    setSaving(false)
    setEditOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!profile || !user) return null

  const displayName = profile.full_name || user.email?.split("@")[0] || "Freelance"
  const ini = initials(profile.full_name, user.email)
  const hasContent =
    !!profile.job_title || !!profile.bio ||
    profile.skills.length > 0 ||
    profile.portfolio_links.filter(Boolean).length > 0

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background">
        <div className="relative">
          <ZelligeCover />
          <Button
            variant="outline"
            onClick={() => setEditOpen(true)}
            className="absolute top-4 end-4 sm:end-8 z-10 h-11 bg-white/90 hover:bg-white text-gray-800 border-white/40 shadow-md backdrop-blur-sm font-medium"
          >
            <Edit2 className="h-3.5 w-3.5" />
            {t.editBtn}
          </Button>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="relative z-10 -mt-16 pb-6 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white shadow-xl shrink-0 p-1.5">
                <div className="relative w-full h-full rounded-full bg-primary overflow-hidden flex items-center justify-center">
                  {profile.avatar_url ? (
                    <Image src={profile.avatar_url} alt={displayName} fill sizes="128px" className="object-cover" />
                  ) : (
                    <span className="text-3xl sm:text-4xl font-bold text-white leading-none select-none">{ini}</span>
                  )}
                </div>
              </div>
              <div className="sm:pt-16 min-w-0 flex-1 pb-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground leading-tight">{displayName}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {profile.job_title && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                      {profile.job_title}
                    </span>
                  )}
                  {profile.hourly_rate != null && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-foreground text-xs font-semibold border border-border">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                      {formatPrice(profile.hourly_rate, lang)} MAD/h
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Edit sheet */}
          <Sheet open={editOpen} onOpenChange={handleSheetChange}>
            <SheetContent className="sm:max-w-xl gap-0 p-0 flex flex-col">
              <SheetHeader className="px-6 py-4 border-b border-border shrink-0">
                <SheetTitle>{t.sheet.title}</SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="relative w-20 h-20 rounded-full overflow-hidden bg-primary flex items-center justify-center shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    {form.avatar_url ? (
                      <Image src={form.avatar_url} alt="" fill sizes="80px" className="object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-primary-foreground">{ini}</span>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      {uploading ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
                    </div>
                  </button>
                  <div>
                    <p className="text-sm font-medium">{t.sheet.avatarLabel}</p>
                    <p className="text-xs text-muted-foreground mb-2">{t.sheet.avatarHint}</p>
                    <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                      {uploading ? t.sheet.uploading : t.sheet.changePhoto}
                    </Button>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>

                {/* Full name */}
                <div className="space-y-1.5">
                  <Label htmlFor="edit-name">{t.sheet.fullNameLabel}</Label>
                  <Input
                    id="edit-name"
                    value={form.full_name ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value || null }))}
                    placeholder={t.sheet.fullNamePlaceholder}
                  />
                </div>

                {/* Job title */}
                <div className="space-y-1.5">
                  <Label htmlFor="edit-title">{t.sheet.jobTitleLabel}</Label>
                  <Input
                    id="edit-title"
                    value={form.job_title ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, job_title: e.target.value || null }))}
                    placeholder={t.sheet.jobTitlePlaceholder}
                  />
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <Label htmlFor="edit-bio">{t.sheet.bioLabel}</Label>
                  <Textarea
                    id="edit-bio"
                    value={form.bio ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value || null }))}
                    placeholder={t.sheet.bioPlaceholder}
                    className="min-h-[130px] resize-none"
                  />
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <Label>{t.sheet.skillsLabel}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill() } }}
                      placeholder={t.sheet.skillsPlaceholder}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={addSkill}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {form.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {form.skills.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                          {skill}
                          <button
                            onClick={() => setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }))}
                            className="hover:text-primary/60 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hourly rate */}
                <div className="space-y-1.5">
                  <Label htmlFor="edit-rate">{t.sheet.rateLabel}</Label>
                  <div className="relative">
                    <Input
                      id="edit-rate"
                      type="number"
                      min={0}
                      step={50}
                      value={form.hourly_rate ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, hourly_rate: e.target.value ? Number(e.target.value) : null }))}
                      placeholder="ex. 350"
                      className="pe-16"
                    />
                    <span className="absolute end-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                      MAD/h
                    </span>
                  </div>
                </div>

                {/* Portfolio links */}
                <div className="space-y-2">
                  <Label>{t.sheet.portfolioLabel}</Label>
                  <div className="space-y-2">
                    {form.portfolio_links.map((link, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          value={link}
                          onChange={(e) => {
                            const next = [...form.portfolio_links]
                            next[i] = e.target.value
                            setForm((f) => ({ ...f, portfolio_links: next }))
                          }}
                          placeholder="https://..."
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setForm((f) => ({ ...f, portfolio_links: f.portfolio_links.filter((_, j) => j !== i) }))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setForm((f) => ({ ...f, portfolio_links: [...f.portfolio_links, ""] }))}
                    >
                      <Plus className="h-4 w-4" />
                      {t.sheet.addLink}
                    </Button>
                  </div>
                </div>

                {/* CIN Verification */}
                <div className="space-y-3 pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Label className="text-sm font-semibold">{t.cin.sectionTitle}</Label>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.cin.sectionDesc}</p>

                  {/* Status badge */}
                  {profile?.cin_status === "verified" && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
                      <ShieldCheck className="h-4 w-4 shrink-0" />
                      {t.cin.statusVerified}
                    </div>
                  )}
                  {profile?.cin_status === "pending" && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium">
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                      {t.cin.statusPending}
                    </div>
                  )}
                  {profile?.cin_status === "rejected" && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      {t.cin.statusRejected}
                    </div>
                  )}
                  {(!profile?.cin_status || profile.cin_status === "none") && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border text-muted-foreground text-sm">
                      <Shield className="h-4 w-4 shrink-0" />
                      {t.cin.statusNone}
                    </div>
                  )}

                  {/* Upload button — blocked while pending or verified */}
                  {profile?.cin_status !== "pending" && profile?.cin_status !== "verified" && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-11"
                        onClick={() => cinRef.current?.click()}
                        disabled={cinUploading}
                      >
                        {cinUploading ? (
                          <><Loader2 className="h-4 w-4 animate-spin" />{t.cin.uploading}</>
                        ) : (
                          <><Upload className="h-4 w-4" />{t.cin.uploadBtn}</>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground">{t.cin.hint}</p>
                      <input
                        ref={cinRef}
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        className="hidden"
                        onChange={handleCinUpload}
                      />
                    </>
                  )}
                  {profile?.cin_status === "pending" && (
                    <p className="text-xs text-muted-foreground">{t.cin.blockedPending}</p>
                  )}

                  {cinError && (
                    <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                      {cinError}
                    </p>
                  )}
                </div>

                {saveError && (
                  <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                    {saveError}
                  </p>
                )}
              </div>

              <div className="px-6 py-4 border-t border-border shrink-0">
                <Button onClick={handleSave} disabled={saving} size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  {saving ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />{t.sheet.saving}</>
                  ) : (
                    <><Save className="h-4 w-4" />{t.sheet.saveBtn}</>
                  )}
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Stats row */}
          <div className="py-5 border-b border-border grid grid-cols-3 divide-x divide-border rtl:divide-x-reverse">
            {[
              { icon: Calendar, label: t.memberSince, value: memberSince(profile.updated_at) },
              { icon: MessageSquare, label: t.responseRate, value: "—" },
              { icon: CheckCircle2, label: t.missions, value: "—" },
            ].map(({ icon: Icon, label, value }, i) => (
              <div key={i} className="text-center px-1.5 sm:px-4">
                <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-muted-foreground mb-1.5">
                  <Icon className="h-3.5 w-3.5 shrink-0 hidden sm:block" />
                  <span className="text-[10px] sm:text-xs uppercase tracking-wide font-medium leading-tight">{label}</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-foreground capitalize">{value}</p>
              </div>
            ))}
          </div>

          {/* Body */}
          {!hasContent ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">{t.emptyTitle}</h2>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto text-sm">{t.emptySub}</p>
              <Button onClick={() => setEditOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Edit2 className="h-4 w-4" />
                {t.emptyCta}
              </Button>
            </div>
          ) : (
            <div className="py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 space-y-8">
                {profile.bio && (
                  <section>
                    <h2 className="text-base font-semibold mb-3 text-foreground">{t.about}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm">{profile.bio}</p>
                  </section>
                )}

                {profile.skills.length > 0 && (
                  <section>
                    <h2 className="text-base font-semibold mb-3 text-foreground">{t.skills}</h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((s) => (
                        <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 hover:bg-primary/15 transition-colors">
                          <Tag className="h-3 w-3 shrink-0" />
                          {s}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {profile.portfolio_links.filter(Boolean).length > 0 && (
                  <section>
                    <h2 className="text-base font-semibold mb-3 text-foreground">{t.portfolio}</h2>
                    <div className="space-y-2">
                      {profile.portfolio_links.filter(Boolean).map((link, i) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-muted transition-colors group"
                        >
                          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                          <span className="text-sm text-foreground truncate">{link}</span>
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                <section>
                  <h2 className="text-base font-semibold mb-3 text-foreground">{t.proposedServices}</h2>
                  <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">{t.noServices}</p>
                    <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">{t.noServicesSub}</p>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Plus className="h-3.5 w-3.5" />
                      {t.addService}
                    </Button>
                  </div>
                </section>
              </div>

              {/* Sidebar */}
              <div>
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                  {profile.hourly_rate != null && (
                    <div className="pb-4 border-b border-border">
                      <p className="text-xs text-muted-foreground mb-1">{t.hourlyRate}</p>
                      <p className="text-2xl font-bold text-foreground">
                        {profile.hourly_rate.toLocaleString("fr-MA")}
                        <span className="text-sm font-normal text-muted-foreground ms-1">MAD/h</span>
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">{t.profileNote}</p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/profil/${user.id}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                      {t.viewPublic}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
