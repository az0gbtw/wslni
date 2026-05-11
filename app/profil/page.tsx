"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Camera, Edit2, Plus, X, ExternalLink,
  Loader2, Save, Briefcase,
} from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface Profile {
  id: string
  full_name: string | null
  job_title: string | null
  bio: string | null
  skills: string[]
  hourly_rate: number | null
  portfolio_links: string[]
  avatar_url: string | null
}

type FormData = Omit<Profile, "id">

const EMPTY: FormData = {
  full_name: null,
  job_title: null,
  bio: null,
  skills: [],
  hourly_rate: null,
  portfolio_links: [],
  avatar_url: null,
}

function initials(name: string | null, email?: string | null) {
  const src = name || email?.split("@")[0] || "?"
  return src.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

function formFromProfile(p: Profile): FormData {
  return {
    full_name: p.full_name,
    job_title: p.job_title,
    bio: p.bio,
    skills: p.skills ?? [],
    hourly_rate: p.hourly_rate,
    portfolio_links: p.portfolio_links ?? [],
    avatar_url: p.avatar_url,
  }
}

export default function ProfilPage() {
  const router = useRouter()
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

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace("/connexion"); return }
      setUser(user)

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      const p: Profile = data ?? {
        id: user.id,
        ...EMPTY,
        full_name: (user.user_metadata?.full_name as string) ?? null,
      }
      setProfile(p)
      setForm(formFromProfile(p))
      setLoading(false)
    })
  }, [router])

  function handleSheetChange(open: boolean) {
    setEditOpen(open)
    if (!open && profile) {
      setForm(formFromProfile(profile))
      setSaveError(null)
    }
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

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setSaveError(null)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        { id: user.id, ...form, portfolio_links: form.portfolio_links.filter(Boolean) },
        { onConflict: "id" },
      )
      .select()
      .single()

    if (error || !data) {
      setSaveError("Erreur lors de la sauvegarde. Veuillez réessayer.")
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
    !!profile.job_title ||
    !!profile.bio ||
    profile.skills.length > 0 ||
    profile.portfolio_links.filter(Boolean).length > 0

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background">
        {/* Cover strip */}
        <div className="h-36 bg-gradient-to-br from-primary to-primary/60" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 pb-6 border-b border-border">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-background bg-primary flex items-center justify-center overflow-hidden shadow-md shrink-0">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl sm:text-3xl font-bold text-primary-foreground">{ini}</span>
                )}
              </div>
              <div className="mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">{displayName}</h1>
                {profile.job_title && (
                  <p className="text-muted-foreground text-sm mt-0.5">{profile.job_title}</p>
                )}
                {profile.hourly_rate != null && (
                  <p className="text-primary font-semibold text-sm mt-1">
                    {profile.hourly_rate.toLocaleString("fr-MA")} MAD/h
                  </p>
                )}
              </div>
            </div>

            <Sheet open={editOpen} onOpenChange={handleSheetChange}>
              <SheetTrigger asChild>
                <Button variant="outline" className="self-start sm:self-auto shrink-0">
                  <Edit2 className="h-4 w-4" />
                  Modifier le profil
                </Button>
              </SheetTrigger>

              <SheetContent className="sm:max-w-xl gap-0 p-0 flex flex-col">
                <SheetHeader className="px-6 py-4 border-b border-border shrink-0">
                  <SheetTitle>Modifier mon profil</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                  {/* Avatar upload */}
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="relative w-20 h-20 rounded-full overflow-hidden bg-primary flex items-center justify-center shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      {form.avatar_url ? (
                        <img src={form.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-primary-foreground">{ini}</span>
                      )}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                        {uploading ? (
                          <Loader2 className="h-5 w-5 text-white animate-spin" />
                        ) : (
                          <Camera className="h-5 w-5 text-white" />
                        )}
                      </div>
                    </button>
                    <div>
                      <p className="text-sm font-medium">Photo de profil</p>
                      <p className="text-xs text-muted-foreground mb-2">JPG, PNG, WebP · Max 2 Mo</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? "Téléchargement..." : "Changer la photo"}
                      </Button>
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>

                  {/* Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-name">Nom complet</Label>
                    <Input
                      id="edit-name"
                      value={form.full_name ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value || null }))}
                      placeholder="Votre nom et prénom"
                    />
                  </div>

                  {/* Job title */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-title">Titre professionnel</Label>
                    <Input
                      id="edit-title"
                      value={form.job_title ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, job_title: e.target.value || null }))}
                      placeholder="ex. Développeur Web Full-Stack"
                    />
                  </div>

                  {/* Bio */}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-bio">Description / Bio</Label>
                    <Textarea
                      id="edit-bio"
                      value={form.bio ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value || null }))}
                      placeholder="Décrivez votre expérience, vos spécialités et ce que vous pouvez apporter à vos clients..."
                      className="min-h-[130px] resize-none"
                    />
                  </div>

                  {/* Skills */}
                  <div className="space-y-2">
                    <Label>Compétences</Label>
                    <div className="flex gap-2">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault()
                            addSkill()
                          }
                        }}
                        placeholder="ex. React, Figma, SEO — Entrée pour ajouter"
                      />
                      <Button type="button" variant="outline" size="icon" onClick={addSkill} aria-label="Ajouter">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {form.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {form.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
                          >
                            {skill}
                            <button
                              onClick={() =>
                                setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }))
                              }
                              className="hover:text-primary/60 transition-colors"
                              aria-label={`Supprimer ${skill}`}
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
                    <Label htmlFor="edit-rate">Tarif horaire</Label>
                    <div className="relative">
                      <Input
                        id="edit-rate"
                        type="number"
                        min={0}
                        step={50}
                        value={form.hourly_rate ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            hourly_rate: e.target.value ? Number(e.target.value) : null,
                          }))
                        }
                        placeholder="ex. 350"
                        className="pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                        MAD/h
                      </span>
                    </div>
                  </div>

                  {/* Portfolio links */}
                  <div className="space-y-2">
                    <Label>Liens portfolio</Label>
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
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                portfolio_links: f.portfolio_links.filter((_, j) => j !== i),
                              }))
                            }
                            aria-label="Supprimer"
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
                        onClick={() =>
                          setForm((f) => ({ ...f, portfolio_links: [...f.portfolio_links, ""] }))
                        }
                      >
                        <Plus className="h-4 w-4" />
                        Ajouter un lien
                      </Button>
                    </div>
                  </div>

                  {saveError && (
                    <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                      {saveError}
                    </p>
                  )}
                </div>

                {/* Sticky save */}
                <div className="px-6 py-4 border-t border-border shrink-0">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {saving ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Sauvegarde en cours...</>
                    ) : (
                      <><Save className="h-4 w-4" />Sauvegarder les modifications</>
                    )}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Body */}
          {!hasContent ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Votre profil est vide</h2>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto text-sm">
                Complétez votre profil pour être visible par des clients potentiels.
              </p>
              <Button
                onClick={() => setEditOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Edit2 className="h-4 w-4" />
                Compléter mon profil
              </Button>
            </div>
          ) : (
            <div className="py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Main content */}
              <div className="lg:col-span-2 space-y-8">
                {profile.bio && (
                  <section>
                    <h2 className="text-base font-semibold mb-3 text-foreground">À propos</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm">
                      {profile.bio}
                    </p>
                  </section>
                )}

                {profile.skills.length > 0 && (
                  <section>
                    <h2 className="text-base font-semibold mb-3 text-foreground">Compétences</h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((s) => (
                        <span
                          key={s}
                          className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {profile.portfolio_links.filter(Boolean).length > 0 && (
                  <section>
                    <h2 className="text-base font-semibold mb-3 text-foreground">Portfolio</h2>
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
              </div>

              {/* Sidebar */}
              <div>
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                  {profile.hourly_rate != null && (
                    <div className="pb-4 border-b border-border">
                      <p className="text-xs text-muted-foreground mb-1">Tarif horaire</p>
                      <p className="text-2xl font-bold text-foreground">
                        {profile.hourly_rate.toLocaleString("fr-MA")}
                        <span className="text-sm font-normal text-muted-foreground ml-1">MAD/h</span>
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Voici comment votre profil apparaît aux clients.
                  </p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/profil/${user.id}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Voir le profil public
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
