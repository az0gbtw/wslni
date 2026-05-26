"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, Plus, X, Save, ShieldCheck, ShieldAlert, Shield, Upload } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

type CinStatus = "none" | "pending" | "verified" | "rejected"

interface Profile {
  id: string
  full_name: string | null
  job_title: string | null
  bio: string | null
  skills: string[]
  hourly_rate: number | null
  cin_status?: CinStatus
}

export default function ParametresPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const t = translations[lang].parametres
  const { toast } = useToast()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Section 1: Personal info
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [savingPersonal, setSavingPersonal] = useState(false)

  // Section 2: Freelance profile
  const [jobTitle, setJobTitle] = useState("")
  const [bio, setBio] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const [hourlyRate, setHourlyRate] = useState("")
  const [languages, setLanguages] = useState<string[]>([])
  const [langInput, setLangInput] = useState("")
  const [savingFreelance, setSavingFreelance] = useState(false)

  // Section 3: CIN verification
  const [cinStatus, setCinStatus] = useState<CinStatus>("none")
  const [cinUploading, setCinUploading] = useState(false)
  const cinRef = useRef<HTMLInputElement>(null)

  // Section 4: Security
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace("/connexion"); return }
      setUser(user)

      // Load metadata
      setPhone((user.user_metadata?.phone as string) ?? "")
      setLocation((user.user_metadata?.location as string) ?? "")
      setLanguages((user.user_metadata?.languages as string[]) ?? [])

      // Load profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, job_title, bio, skills, hourly_rate, cin_status")
        .eq("id", user.id)
        .single()

      if (profile) {
        setFullName(profile.full_name ?? "")
        setJobTitle(profile.job_title ?? "")
        setBio(profile.bio ?? "")
        setSkills(profile.skills ?? [])
        setHourlyRate(profile.hourly_rate != null ? String(profile.hourly_rate) : "")
        setCinStatus((profile.cin_status as CinStatus) ?? "none")
      } else {
        setFullName((user.user_metadata?.full_name as string) ?? "")
      }

      setLoading(false)
    })
  }, [router])

  function addTag(value: string, list: string[], setList: (v: string[]) => void, setInput: (v: string) => void) {
    const trimmed = value.trim()
    if (!trimmed || list.includes(trimmed)) { setInput(""); return }
    setList([...list, trimmed])
    setInput("")
  }

  function removeTag(value: string, list: string[], setList: (v: string[]) => void) {
    setList(list.filter((s) => s !== value))
  }

  async function handleSavePersonal() {
    if (!user) return
    setSavingPersonal(true)
    const supabase = createClient()

    const [profileRes, metaRes] = await Promise.all([
      supabase
        .from("profiles")
        .upsert({ id: user.id, full_name: fullName || null }, { onConflict: "id" })
        .select()
        .single(),
      supabase.auth.updateUser({ data: { phone, location } }),
    ])

    setSavingPersonal(false)

    if (profileRes.error || metaRes.error) {
      toast({ title: t.personal.errorMsg, variant: "destructive" })
    } else {
      toast({ title: t.personal.successMsg })
    }
  }

  async function handleSaveFreelance() {
    if (!user) return
    setSavingFreelance(true)
    const supabase = createClient()

    const [profileRes, metaRes] = await Promise.all([
      supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            job_title: jobTitle || null,
            bio: bio || null,
            skills,
            hourly_rate: hourlyRate ? Number(hourlyRate) : null,
          },
          { onConflict: "id" }
        )
        .select()
        .single(),
      supabase.auth.updateUser({ data: { languages } }),
    ])

    setSavingFreelance(false)

    if (profileRes.error || metaRes.error) {
      toast({ title: t.freelance.errorMsg, variant: "destructive" })
    } else {
      toast({ title: t.freelance.successMsg })
    }
  }

  async function handleSavePassword() {
    if (!user) return

    if (newPassword !== confirmPassword) {
      toast({ title: t.security.mismatchError, variant: "destructive" })
      return
    }
    if (newPassword.length < 8) {
      toast({ title: t.security.tooShortError, variant: "destructive" })
      return
    }

    setSavingPassword(true)
    const supabase = createClient()

    // Re-authenticate with current password first
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    })

    if (signInError) {
      setSavingPassword(false)
      toast({ title: t.security.errorMsg, variant: "destructive" })
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPassword(false)

    if (error) {
      toast({ title: t.security.errorMsg, variant: "destructive" })
    } else {
      toast({ title: t.security.successMsg })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    }
  }

  async function handleCinUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    if (cinRef.current) cinRef.current.value = ""

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Le fichier dépasse 5 Mo.", variant: "destructive" })
      return
    }

    setCinUploading(true)

    const body = new FormData()
    body.append("file", file)

    const res = await fetch("/api/cin", { method: "POST", body })
    setCinUploading(false)

    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      console.error("[CIN upload] API error:", json)
      toast({ title: "Erreur lors de l'envoi. Veuillez réessayer.", variant: "destructive" })
      return
    }

    setCinStatus("pending")
    toast({ title: "CIN envoyée — vérification en cours." })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">

          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
          </div>

          <div className="space-y-6">

            {/* Section 1: Personal info */}
            <section className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
              <h2 className="text-base font-semibold text-foreground mb-5">{t.personal.title}</h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="full-name">{t.personal.fullNameLabel}</Label>
                  <Input
                    id="full-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.personal.fullNamePlaceholder}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">{t.personal.emailLabel}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email ?? ""}
                    readOnly
                    className="bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">{t.personal.phoneLabel}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.personal.phonePlaceholder}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="location">{t.personal.locationLabel}</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t.personal.locationPlaceholder}
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <Button
                  onClick={handleSavePersonal}
                  disabled={savingPersonal}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {savingPersonal ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />{t.personal.saving}</>
                  ) : (
                    <><Save className="h-4 w-4" />{t.personal.saveBtn}</>
                  )}
                </Button>
              </div>
            </section>

            {/* Section 2: Freelance profile */}
            <section className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
              <h2 className="text-base font-semibold text-foreground mb-5">{t.freelance.title}</h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="job-title">{t.freelance.jobTitleLabel}</Label>
                  <Input
                    id="job-title"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder={t.freelance.jobTitlePlaceholder}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bio">{t.freelance.bioLabel}</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={t.freelance.bioPlaceholder}
                    className="min-h-[120px] resize-none"
                  />
                </div>

                {/* Skills tag input */}
                <div className="space-y-2">
                  <Label>{t.freelance.skillsLabel}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault()
                          addTag(skillInput, skills, setSkills, setSkillInput)
                        }
                      }}
                      placeholder={t.freelance.skillsPlaceholder}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => addTag(skillInput, skills, setSkills, setSkillInput)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeTag(skill, skills, setSkills)}
                            className="hover:text-primary/60 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="hourly-rate">{t.freelance.hourlyRateLabel}</Label>
                  <div className="relative">
                    <Input
                      id="hourly-rate"
                      type="number"
                      min={0}
                      step={50}
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="350"
                      className="pe-16"
                    />
                    <span className="absolute end-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                      MAD/h
                    </span>
                  </div>
                </div>

                {/* Languages tag input */}
                <div className="space-y-2">
                  <Label>{t.freelance.languagesLabel}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={langInput}
                      onChange={(e) => setLangInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault()
                          addTag(langInput, languages, setLanguages, setLangInput)
                        }
                      }}
                      placeholder={t.freelance.languagesPlaceholder}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => addTag(langInput, languages, setLanguages, setLangInput)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {languages.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {languages.map((lang) => (
                        <span
                          key={lang}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-foreground text-sm font-medium border border-border"
                        >
                          {lang}
                          <button
                            type="button"
                            onClick={() => removeTag(lang, languages, setLanguages)}
                            className="hover:text-muted-foreground/60 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <Button
                  onClick={handleSaveFreelance}
                  disabled={savingFreelance}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {savingFreelance ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />{t.freelance.saving}</>
                  ) : (
                    <><Save className="h-4 w-4" />{t.freelance.saveBtn}</>
                  )}
                </Button>
              </div>
            </section>

            {/* Section 3: CIN verification */}
            <section className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                <h2 className="text-base font-semibold text-foreground">Vérification d'identité</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                Téléversez une photo de votre CIN (recto) pour obtenir le badge « Vérifié » sur votre profil public.
              </p>

              {cinStatus === "verified" && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  Identité vérifiée ✓
                </div>
              )}

              {cinStatus === "pending" && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium">
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  En attente de vérification — votre CIN est en cours d'examen.
                </div>
              )}

              {(cinStatus === "none" || cinStatus === "rejected") && (
                <div className="space-y-3">
                  {cinStatus === "rejected" && (
                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                      <ShieldAlert className="h-5 w-5 shrink-0" />
                      Refusé — veuillez soumettre une nouvelle photo lisible.
                    </div>
                  )}

                  <div
                    onClick={() => !cinUploading && cinRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                      cinUploading
                        ? "border-border bg-muted cursor-not-allowed"
                        : "border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                    }`}
                  >
                    {cinUploading ? (
                      <>
                        <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                        <p className="text-sm text-muted-foreground">Envoi en cours…</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Cliquez pour choisir votre CIN</p>
                          <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG ou PDF · Recto uniquement · Max 5 Mo</p>
                        </div>
                      </>
                    )}
                    <input
                      ref={cinRef}
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,application/pdf"
                      className="hidden"
                      onChange={handleCinUpload}
                      disabled={cinUploading}
                    />
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => cinRef.current?.click()}
                    disabled={cinUploading}
                  >
                    {cinUploading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Envoi en cours…</>
                    ) : (
                      <><Upload className="h-4 w-4" />Téléverser ma CIN</>
                    )}
                  </Button>
                </div>
              )}
            </section>

            {/* Section 4: Security */}
            <section className="rounded-2xl border border-border bg-card p-6" id="securite">
              <h2 className="text-base font-semibold text-foreground mb-5">{t.security.title}</h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="current-password">{t.security.currentPasswordLabel}</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pe-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new-password">{t.security.newPasswordLabel}</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pe-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password">{t.security.confirmPasswordLabel}</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pe-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <Button
                  onClick={handleSavePassword}
                  disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {savingPassword ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />{t.security.saving}</>
                  ) : (
                    <><Save className="h-4 w-4" />{t.security.saveBtn}</>
                  )}
                </Button>
              </div>
            </section>

          </div>
        </div>
      </main>
    </>
  )
}
