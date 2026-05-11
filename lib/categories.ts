export const CATEGORIES = [
  { value: "design-graphique",    label: "Design Graphique & Branding" },
  { value: "montage-video",       label: "Montage Vidéo & Motion" },
  { value: "production-musicale", label: "Production Musicale & Mixage" },
  { value: "developpement-web",   label: "Développement Web & Mobile" },
  { value: "reseaux-sociaux",     label: "Gestion des Réseaux Sociaux" },
  { value: "photographie",        label: "Photographie & Retouche" },
  { value: "traduction",          label: "Traduction (AR/FR/EN)" },
  { value: "cours-particuliers",  label: "Cours Particuliers & Aide Scolaire" },
  { value: "conseil-financier",   label: "Conseil Financier" },
  { value: "aide-juridique",      label: "Aide Juridique & Administrative" },
  { value: "voice-over",          label: "Voice Over & Podcast" },
  { value: "animation-3d",        label: "3D & Animation" },
  { value: "redaction",           label: "Rédaction & Copywriting" },
  { value: "saisie-donnees",      label: "Saisie de Données & Assistant Virtuel" },
  { value: "evenements",          label: "Organisation d'Événements" },
  { value: "mode-textile",        label: "Mode & Design Textile" },
] as const

export type CategoryValue = (typeof CATEGORIES)[number]["value"]

export const CATEGORY_COLORS: Record<string, string> = {
  "design-graphique":    "bg-rose-100 text-rose-700",
  "montage-video":       "bg-blue-100 text-blue-700",
  "production-musicale": "bg-purple-100 text-purple-700",
  "developpement-web":   "bg-emerald-100 text-emerald-700",
  "reseaux-sociaux":     "bg-pink-100 text-pink-700",
  "photographie":        "bg-amber-100 text-amber-700",
  "traduction":          "bg-cyan-100 text-cyan-700",
  "cours-particuliers":  "bg-indigo-100 text-indigo-700",
  "conseil-financier":   "bg-green-100 text-green-700",
  "aide-juridique":      "bg-slate-100 text-slate-700",
  "voice-over":          "bg-orange-100 text-orange-700",
  "animation-3d":        "bg-violet-100 text-violet-700",
  "redaction":           "bg-teal-100 text-teal-700",
  "saisie-donnees":      "bg-sky-100 text-sky-700",
  "evenements":          "bg-fuchsia-100 text-fuchsia-700",
  "mode-textile":        "bg-red-100 text-red-700",
}

export function getCategoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value
}
