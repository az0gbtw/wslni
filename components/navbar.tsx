"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Menu, X, Globe, LogOut, LayoutDashboard, MessageSquare, ChevronDown, User as UserIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function getInitials(user: User): string {
  const name = user.user_metadata?.full_name as string | undefined
  if (name) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  }
  return user.email?.[0]?.toUpperCase() ?? "U"
}

export function Navbar() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [language, setLanguage] = useState<"fr" | "ar">("fr")
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [unreadCount, setUnreadCount] = useState(0)

  const desktopSearchRef = useRef<HTMLInputElement>(null)
  const mobileSearchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr"
    document.documentElement.lang = language === "ar" ? "ar" : "fr"
  }, [language])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      return
    }
    const supabase = createClient()

    async function fetchUnread() {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false)
        .neq("sender_id", user!.id)
      setUnreadCount(count ?? 0)
    }

    fetchUnread()

    const channel = supabase
      .channel("navbar-unread")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, fetchUnread)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  function handleSearch(query: string) {
    const q = query.trim()
    if (!q) return
    setIsMobileMenuOpen(false)
    router.push(`/services?q=${encodeURIComponent(q)}`)
  }

  function onDesktopSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSearch(e.currentTarget.value)
  }

  function onMobileSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSearch(e.currentTarget.value)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <a href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
              <span className="text-xl font-bold text-primary-foreground">W</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">
              Wslni.ma
            </span>
          </a>

          {/* Barre de recherche (md+) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full group">
              <button
                type="button"
                aria-label="Rechercher"
                onClick={() => handleSearch(desktopSearchRef.current?.value ?? "")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors hover:text-primary"
              >
                <Search className="h-4 w-4" />
              </button>
              <input
                ref={desktopSearchRef}
                type="text"
                placeholder="Rechercher un service..."
                onKeyDown={onDesktopSearchKey}
                className="w-full h-10 pl-10 pr-4 rounded-full border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Navigation desktop (lg+) */}
          <div className="hidden lg:flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-sm font-medium" asChild>
              <Link href="/services">Explorer</Link>
            </Button>

            <div className="w-px h-6 bg-border" />

            {/* Bascule de langue */}
            <button
              onClick={() => setLanguage(language === "fr" ? "ar" : "fr")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted text-sm font-medium transition-colors"
              aria-label="Changer de langue"
            >
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className={language === "fr" ? "text-foreground" : "text-muted-foreground"}>FR</span>
              <span className="text-muted-foreground">|</span>
              <span className={language === "ar" ? "text-foreground" : "text-muted-foreground"}>AR</span>
            </button>

            <div className="w-px h-6 bg-border" />

            {user === undefined ? null : user ? (
              <>
                {/* Messages */}
                <Button variant="ghost" size="sm" className="text-sm font-medium relative" asChild>
                  <Link href="/messages">
                    <MessageSquare className="h-4 w-4" />
                    Messages
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>
                </Button>

                {/* Menu utilisateur */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-full border border-border bg-card hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                        {getInitials(user)}
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                        <LayoutDashboard className="h-4 w-4" />
                        Tableau de bord
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profil" className="flex items-center gap-2 cursor-pointer">
                        <UserIcon className="h-4 w-4" />
                        Mon profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="text-sm font-medium" asChild>
                  <Link href="/connexion">Connexion</Link>
                </Button>
                <Button size="sm" className="text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                  <Link href="/inscription">S&apos;inscrire</Link>
                </Button>
              </>
            )}
          </div>

          {/* Bouton menu mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Ouvrir le menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Menu mobile */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          isMobileMenuOpen ? "max-h-screen" : "max-h-0"
        }`}
      >
        <div className="px-4 py-4 space-y-2 bg-background/95 backdrop-blur-md border-t border-border">

          {/* Recherche mobile */}
          <div className="relative">
            <button
              type="button"
              aria-label="Rechercher"
              onClick={() => handleSearch(mobileSearchRef.current?.value ?? "")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
            <input
              ref={mobileSearchRef}
              type="text"
              placeholder="Rechercher un service..."
              onKeyDown={onMobileSearchKey}
              className="w-full h-10 pl-10 pr-4 rounded-full border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <Button variant="ghost" className="w-full justify-start text-sm font-medium" asChild>
            <Link href="/services">Explorer</Link>
          </Button>

          <div className="h-px bg-border" />

          {/* Bascule de langue */}
          <button
            onClick={() => setLanguage(language === "fr" ? "ar" : "fr")}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted text-sm font-medium transition-colors"
          >
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className={language === "fr" ? "text-foreground" : "text-muted-foreground"}>Français</span>
            <span className="text-muted-foreground">/</span>
            <span className={language === "ar" ? "text-foreground" : "text-muted-foreground"}>العربية</span>
          </button>

          <div className="h-px bg-border" />

          {user === undefined ? null : user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                  {getInitials(user)}
                </div>
                <span className="text-foreground font-medium truncate">
                  {(user.user_metadata?.full_name as string) || user.email}
                </span>
              </div>
              <Button variant="ghost" className="w-full justify-start text-sm font-medium" asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Tableau de bord
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm font-medium" asChild>
                <Link href="/profil">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Mon profil
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm font-medium" asChild>
                <Link href="/messages" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Messages
                  {unreadCount > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm font-medium text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="w-full justify-start text-sm font-medium" asChild>
                <Link href="/connexion">Connexion</Link>
              </Button>
              <Button className="w-full text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                <Link href="/inscription">S&apos;inscrire</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
