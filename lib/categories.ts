export const CATEGORY_GROUPS = [
  {
    value: "graphics-design",
    label: "Graphics & Design",
    subcategories: [
      { value: "logo-identite",       label: "Logo & Identité de marque" },
      { value: "design-web-app",      label: "Design Web & App" },
      { value: "illustration-art",    label: "Illustration & Art" },
      { value: "design-print",        label: "Design Print" },
      { value: "design-mode",         label: "Design de Mode" },
      { value: "design-3d",           label: "Design 3D" },
      { value: "retouche-photo",      label: "Retouche Photo" },
    ],
  },
  {
    value: "programmation-tech",
    label: "Programmation & Tech",
    subcategories: [
      { value: "developpement-web",    label: "Développement Web" },
      { value: "developpement-mobile", label: "Développement Mobile" },
      { value: "developpement-ai",     label: "Développement AI" },
      { value: "cybersecurite",        label: "Cybersécurité" },
      { value: "bases-donnees",        label: "Bases de données" },
      { value: "devops",               label: "DevOps" },
      { value: "support-it",           label: "Support IT" },
    ],
  },
  {
    value: "marketing-digital",
    label: "Marketing Digital",
    subcategories: [
      { value: "seo",                  label: "SEO" },
      { value: "reseaux-sociaux",      label: "Réseaux Sociaux" },
      { value: "pub-facebook-insta",   label: "Publicité Facebook/Instagram" },
      { value: "email-marketing",      label: "Email Marketing" },
      { value: "marketing-contenu",    label: "Marketing de Contenu" },
      { value: "strategie-marketing",  label: "Stratégie Marketing" },
    ],
  },
  {
    value: "video-animation",
    label: "Vidéo & Animation",
    subcategories: [
      { value: "montage-video",        label: "Montage Vidéo" },
      { value: "animation",            label: "Animation" },
      { value: "motion-graphics",      label: "Motion Graphics" },
      { value: "videos-ugc",           label: "Vidéos UGC" },
      { value: "production-video",     label: "Production Vidéo" },
      { value: "sous-titres",          label: "Sous-titres" },
    ],
  },
  {
    value: "redaction-traduction",
    label: "Rédaction & Traduction",
    subcategories: [
      { value: "redaction-web",        label: "Rédaction Web" },
      { value: "copywriting",          label: "Copywriting" },
      { value: "traduction",           label: "Traduction AR/FR/EN" },
      { value: "correction-relecture", label: "Correction & Relecture" },
      { value: "ghostwriting",         label: "Ghostwriting" },
      { value: "cv-lettres",           label: "CV & Lettres" },
    ],
  },
  {
    value: "musique-audio",
    label: "Musique & Audio",
    subcategories: [
      { value: "production-musicale",  label: "Production Musicale" },
      { value: "mixage-mastering",     label: "Mixage & Mastering" },
      { value: "voice-over",           label: "Voice Over" },
      { value: "podcasts",             label: "Podcasts" },
      { value: "jingles",              label: "Jingles" },
      { value: "cours-musique",        label: "Cours de Musique" },
    ],
  },
  {
    value: "business",
    label: "Business",
    subcategories: [
      { value: "comptabilite",         label: "Comptabilité" },
      { value: "conseil-financier",    label: "Conseil Financier" },
      { value: "business-plan",        label: "Business Plan" },
      { value: "ressources-humaines",  label: "Ressources Humaines" },
      { value: "gestion-projet",       label: "Gestion de Projet" },
    ],
  },
  {
    value: "formation-cours",
    label: "Formation & Cours",
    subcategories: [
      { value: "soutien-scolaire",     label: "Soutien Scolaire" },
      { value: "cours-langues",        label: "Cours de Langues" },
      { value: "coaching",             label: "Coaching" },
      { value: "formation-pro",        label: "Formation Professionnelle" },
    ],
  },
  {
    value: "mode-de-vie",
    label: "Mode de Vie",
    subcategories: [
      { value: "design-interieur",          label: "Design d'Intérieur" },
      { value: "photographie",              label: "Photographie" },
      { value: "planification-evenements",  label: "Planification d'Événements" },
      { value: "bien-etre-fitness",         label: "Bien-être & Fitness" },
    ],
  },
]

export const CATEGORIES = CATEGORY_GROUPS.flatMap((g) => g.subcategories)

export type CategoryValue = string

const GROUP_COLORS: Record<string, string> = {
  "graphics-design":      "bg-rose-100 text-rose-700",
  "programmation-tech":   "bg-emerald-100 text-emerald-700",
  "marketing-digital":    "bg-blue-100 text-blue-700",
  "video-animation":      "bg-violet-100 text-violet-700",
  "redaction-traduction": "bg-cyan-100 text-cyan-700",
  "musique-audio":        "bg-purple-100 text-purple-700",
  "business":             "bg-green-100 text-green-700",
  "formation-cours":      "bg-indigo-100 text-indigo-700",
  "mode-de-vie":          "bg-amber-100 text-amber-700",
}

export const CATEGORY_COLORS: Record<string, string> = Object.fromEntries(
  CATEGORY_GROUPS.flatMap((g) =>
    g.subcategories.map((s) => [s.value, GROUP_COLORS[g.value] ?? "bg-gray-100 text-gray-700"])
  )
)

export function getCategoryLabel(value: string): string {
  for (const g of CATEGORY_GROUPS) {
    const sub = g.subcategories.find((s) => s.value === value)
    if (sub) return sub.label
  }
  return value
}

export function getGroupForCategory(categoryValue: string): string | undefined {
  return CATEGORY_GROUPS.find((g) =>
    g.subcategories.some((s) => s.value === categoryValue)
  )?.value
}

export const GROUP_GRADIENTS: Record<string, { bg: string; icon: string }> = {
  "graphics-design":      { bg: "from-rose-50 to-pink-100",      icon: "text-rose-400"    },
  "programmation-tech":   { bg: "from-emerald-50 to-teal-100",   icon: "text-emerald-400" },
  "marketing-digital":    { bg: "from-blue-50 to-indigo-100",    icon: "text-blue-400"    },
  "video-animation":      { bg: "from-violet-50 to-purple-100",  icon: "text-violet-400"  },
  "redaction-traduction": { bg: "from-cyan-50 to-sky-100",       icon: "text-cyan-400"    },
  "musique-audio":        { bg: "from-purple-50 to-fuchsia-100", icon: "text-purple-400"  },
  "business":             { bg: "from-green-50 to-emerald-100",  icon: "text-green-400"   },
  "formation-cours":      { bg: "from-indigo-50 to-blue-100",    icon: "text-indigo-400"  },
  "mode-de-vie":          { bg: "from-amber-50 to-yellow-100",   icon: "text-amber-400"   },
}

export const GROUP_PILL_COLORS: Record<string, { pill: string; count: string }> = {
  "graphics-design":      { pill: "bg-rose-50 text-rose-700 border-rose-200",       count: "bg-rose-100 text-rose-600"      },
  "programmation-tech":   { pill: "bg-emerald-50 text-emerald-700 border-emerald-200", count: "bg-emerald-100 text-emerald-600" },
  "marketing-digital":    { pill: "bg-blue-50 text-blue-700 border-blue-200",        count: "bg-blue-100 text-blue-600"       },
  "video-animation":      { pill: "bg-violet-50 text-violet-700 border-violet-200",  count: "bg-violet-100 text-violet-600"   },
  "redaction-traduction": { pill: "bg-cyan-50 text-cyan-700 border-cyan-200",        count: "bg-cyan-100 text-cyan-600"       },
  "musique-audio":        { pill: "bg-purple-50 text-purple-700 border-purple-200",  count: "bg-purple-100 text-purple-600"   },
  "business":             { pill: "bg-green-50 text-green-700 border-green-200",     count: "bg-green-100 text-green-600"     },
  "formation-cours":      { pill: "bg-indigo-50 text-indigo-700 border-indigo-200",  count: "bg-indigo-100 text-indigo-600"   },
  "mode-de-vie":          { pill: "bg-amber-50 text-amber-700 border-amber-200",     count: "bg-amber-100 text-amber-600"     },
}
