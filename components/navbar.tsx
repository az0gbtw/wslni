"use client"

import { useState, useEffect } from "react"
import { Search, Menu, X, Globe, LogOut, LayoutDashboard, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
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

  const toggleLanguage = () => {
    setLanguage(language === "fr" ? "ar" : "fr")
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

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Rechercher un service..."
                className="w-full h-10 pl-10 pr-4 rounded-full border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <Button variant="ghost" className="text-sm font-medium">
              Explorer
            </Button>
            <Button variant="ghost" className="text-sm font-medium">
              Publier une mission
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted text-sm font-medium transition-colors"
              aria-label="Toggle language"
            >
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className={language === "fr" ? "text-foreground" : "text-muted-foreground"}>
                FR
              </span>
              <span className="text-muted-foreground">|</span>
              <span className={language === "ar" ? "text-foreground" : "text-muted-foreground"}>
                AR
              </span>
            </button>
            
            <div className="w-px h-6 bg-border mx-2" />
            {user === undefined ? null : user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                    {getInitials(user)}
                  </div>
                  <span className="text-foreground font-medium max-w-[120px] truncate">
                    {(user.user_metadata?.full_name as string) || user.email}
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="text-sm font-medium" asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    Tableau de bord
                  </Link>
                </Button>
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
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-sm font-medium">
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="text-sm font-medium" asChild>
                  <Link href="/connexion">Connexion</Link>
                </Button>
                <Button className="text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                  <Link href="/inscription">S&apos;inscrire</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          isMobileMenuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="px-4 py-4 space-y-3 bg-background/95 backdrop-blur-md border-t border-border">
          {/* Mobile Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un service..."
              className="w-full h-10 pl-10 pr-4 rounded-full border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <Button variant="ghost" className="w-full justify-start text-sm font-medium">
            Explorer
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sm font-medium">
            Publier une mission
          </Button>
          <div className="h-px bg-border" />
          
          {/* Mobile Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted text-sm font-medium transition-colors"
            aria-label="Toggle language"
          >
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className={language === "fr" ? "text-foreground" : "text-muted-foreground"}>
              Français
            </span>
            <span className="text-muted-foreground">/</span>
            <span className={language === "ar" ? "text-foreground" : "text-muted-foreground"}>
              العربية
            </span>
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
              <Button variant="ghost" className="w-full justify-start text-sm font-medium" onClick={handleLogout}>
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
