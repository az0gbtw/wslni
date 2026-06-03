"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Search, Menu, X, Globe, LogOut, LayoutDashboard, MessageSquare, ShoppingBag, PackageCheck, ChevronDown, User as UserIcon, Settings, HelpCircle, Briefcase, ShieldCheck, Heart } from "lucide-react"
import { NotificationsBell } from "@/components/notifications-bell"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
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
  const pathname = usePathname()
  const { lang, toggleLang } = useLanguage()
  const t = translations[lang].nav
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [isAdmin, setIsAdmin] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showSearch, setShowSearch] = useState(false)
  const lastScrollY = useRef(0)
  const supabase = useMemo(() => createClient(), [])

  const navRef = useRef<HTMLElement>(null)
  const desktopSearchRef = useRef<HTMLInputElement>(null)
  const mobileSearchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      setIsScrolled(currentY > 10)
      if (currentY > lastScrollY.current && currentY > 80) {
        setIsHidden(true)
        setIsMobileMenuOpen(false)
      } else {
        setIsHidden(false)
      }
      lastScrollY.current = currentY
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (!isMobileMenuOpen) return
    function handleOutsideClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [isMobileMenuOpen])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    if (!user) { setIsAdmin(false); return }
    supabase.from("profiles").select("role").eq("id", user.id).single()
      .then(({ data }) => setIsAdmin(data?.role === "admin"))
  }, [user, supabase])

  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      return
    }

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
  }, [user, supabase])

  // Show search bar only on "/" when scrolled past 500px
  useEffect(() => {
    if (pathname !== "/") { setShowSearch(false); return }
    const onScroll = () => setShowSearch(window.scrollY > 500)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [pathname])

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
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out border-b border-border/30 shadow-sm ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md"
          : "bg-white/90 backdrop-blur-md"
      } ${isHidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/">
            <span style={{fontFamily: 'var(--font-syne), system-ui, sans-serif', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px'}}>
              <span style={{color: '#DC2626'}}>W</span>
              <span style={{position: 'relative', display: 'inline-block'}}>
                <span style={{position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: '#DC2626', lineHeight: 1}}>ّ</span>
                s
              </span>
              <span style={{color: '#1A1A1A'}}>lni</span>
            </span>
          </Link>

          {/* Scroll-reveal search bar — home page only, slides in past 500px */}
          <div className={`hidden md:flex flex-1 justify-center overflow-hidden transition-all duration-300 ease-in-out ${
            showSearch ? "max-w-sm opacity-100" : "max-w-0 opacity-0 pointer-events-none"
          }`}>
            <form
              onSubmit={(e) => { e.preventDefault(); handleSearch(desktopSearchRef.current?.value ?? "") }}
              className="flex items-stretch w-72 rounded-xl overflow-hidden shadow-sm shrink-0"
            >
              <input
                ref={desktopSearchRef}
                type="text"
                name="q"
                placeholder={t.search}
                className="flex-1 bg-gray-100 px-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 outline-none min-w-0"
              />
              <button
                type="submit"
                aria-label={t.search}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium transition-colors shrink-0"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>

          {/* Desktop nav (lg+) */}
          <div className="hidden lg:flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-sm font-medium" asChild>
              <Link href="/services">{t.explore}</Link>
            </Button>

            {isAdmin && (
              <Button variant="ghost" size="sm" className="text-sm font-medium text-primary" asChild>
                <Link href="/admin/verifications">
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </Link>
              </Button>
            )}

            <div className="w-px h-6 bg-border" />

            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted text-sm font-medium transition-all duration-150 hover:scale-[1.04] active:scale-[0.97]"
              aria-label="Changer de langue"
            >
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className={lang === "fr" ? "text-foreground" : "text-muted-foreground"}>FR</span>
              <span className="text-muted-foreground">|</span>
              <span className={lang === "ar" ? "text-foreground" : "text-muted-foreground"}>AR</span>
            </button>

            <div className="w-px h-6 bg-border" />

            {user === undefined ? null : user ? (
              <>
                {/* Bell */}
                <NotificationsBell user={user} />

                {/* Favorites */}
                <Link
                  href="/favoris"
                  aria-label={t.favorites}
                  className="relative flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card hover:bg-muted transition-all duration-150 hover:scale-[1.04] active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Heart className="h-4 w-4 text-foreground" />
                </Link>

                {/* Messages */}
                <Button variant="ghost" size="sm" className="text-sm font-medium relative" asChild>
                  <Link href="/messages">
                    <MessageSquare className="h-4 w-4" />
                    {t.messages}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -end-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>
                </Button>

                {/* Orders */}
                <Button variant="ghost" size="sm" className="text-sm font-medium" asChild>
                  <Link href="/commandes">
                    <ShoppingBag className="h-4 w-4" />
                    {t.orders}
                  </Link>
                </Button>

                {/* To deliver */}
                <Button variant="ghost" size="sm" className="text-sm font-medium" asChild>
                  <Link href="/a-livrer">
                    <PackageCheck className="h-4 w-4" />
                    {t.toDeliver}
                  </Link>
                </Button>

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-full border border-border bg-card hover:bg-muted transition-all duration-150 hover:scale-[1.04] active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                        {getInitials(user)}
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-1">
                    {/* User header */}
                    <div className="px-3 py-2.5 mb-1">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {(user.user_metadata?.full_name as string) || user.email?.split("@")[0]}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />

                    {/* Section 1: Navigation */}
                    <DropdownMenuItem asChild>
                      <Link href={`/profil/${user.id}`} className="flex items-center gap-2.5 cursor-pointer">
                        <UserIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        {t.myProfile}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2.5 cursor-pointer">
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground shrink-0" />
                        {t.dashboard}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard#services" className="flex items-center gap-2.5 cursor-pointer">
                        <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                        {t.myServices}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    {/* Section 2: Settings + Language */}
                    <DropdownMenuItem asChild>
                      <Link href="/parametres" className="flex items-center gap-2.5 cursor-pointer">
                        <Settings className="h-4 w-4 text-muted-foreground shrink-0" />
                        {t.settings}
                      </Link>
                    </DropdownMenuItem>
                    <div
                      className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-sm text-sm cursor-default hover:bg-accent"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="flex items-center gap-2.5 text-foreground">
                        <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                        {t.languageCurrency}
                      </span>
                      <button
                        onClick={toggleLang}
                        className="flex items-center gap-1 text-xs font-semibold border border-border rounded-full px-2 py-0.5 bg-background hover:bg-muted transition-colors shrink-0"
                      >
                        <span className={lang === "fr" ? "text-foreground" : "text-muted-foreground"}>FR</span>
                        <span className="text-muted-foreground/60">|</span>
                        <span className={lang === "ar" ? "text-foreground" : "text-muted-foreground"}>AR</span>
                      </button>
                    </div>
                    <DropdownMenuSeparator />

                    {/* Section 3: Help + Logout */}
                    <DropdownMenuItem asChild>
                      <Link href="/aide" className="flex items-center gap-2.5 cursor-pointer">
                        <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                        {t.helpSupport}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      {t.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="text-sm font-medium" asChild>
                  <Link href="/connexion">{t.login}</Link>
                </Button>
                <Button size="sm" className="text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                  <Link href="/inscription">{t.signup}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Bell + Favorites (mobile only — desktop versions are inside the desktop nav) + mobile menu button */}
          <div className="flex items-center gap-2">
            {user && <span className="lg:hidden"><NotificationsBell user={user} /></span>}
            {user && (
              <Link
                href="/favoris"
                aria-label={t.favorites}
                className="lg:hidden relative flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card hover:bg-muted transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Heart className="h-4 w-4 text-foreground" />
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={t.openMenu}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden border-t border-border bg-background/95 backdrop-blur-md shadow-lg overflow-y-auto"
          style={{ maxHeight: "calc(100dvh - 4rem)" }}
        >
          <div className="px-4 py-4 space-y-2">

            {/* Mobile search */}
            <div className="relative">
              <button
                type="button"
                aria-label={t.search}
                onClick={() => handleSearch(mobileSearchRef.current?.value ?? "")}
                className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-all duration-150 hover:scale-110"
              >
                <Search className="h-4 w-4" />
              </button>
              <input
                ref={mobileSearchRef}
                type="text"
                placeholder={t.search}
                onKeyDown={onMobileSearchKey}
                className="w-full h-10 ps-10 pe-4 rounded-full border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <Button variant="ghost" className="w-full justify-start text-sm font-medium h-11" asChild>
              <Link href="/services" onClick={() => setIsMobileMenuOpen(false)}>{t.explore}</Link>
            </Button>

            <div className="h-px bg-border" />

            {/* Language toggle mobile */}
            <button
              onClick={toggleLang}
              className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-muted text-sm font-medium transition-colors min-h-[44px]"
            >
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className={lang === "fr" ? "text-foreground" : "text-muted-foreground"}>{t.french}</span>
              <span className="text-muted-foreground">/</span>
              <span className={lang === "ar" ? "text-foreground" : "text-muted-foreground"}>{t.arabic}</span>
            </button>

            <div className="h-px bg-border" />

            {user === undefined ? null : user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-card">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                    {getInitials(user)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {(user.user_metadata?.full_name as string) || user.email?.split("@")[0]}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <Button variant="ghost" className="w-full justify-start text-sm font-medium h-11" asChild>
                  <Link href={`/profil/${user.id}`} onClick={() => setIsMobileMenuOpen(false)}>
                    <UserIcon className="h-4 w-4 me-2" />
                    {t.myProfile}
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm font-medium h-11" asChild>
                  <Link href="/messages" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 w-full">
                    <MessageSquare className="h-4 w-4" />
                    <span className="me-2">{t.messages}</span>
                    {unreadCount > 0 && (
                      <span className="ms-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm font-medium h-11" asChild>
                  <Link href="/commandes" onClick={() => setIsMobileMenuOpen(false)}>
                    <ShoppingBag className="h-4 w-4 me-2" />
                    {t.orders}
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm font-medium h-11" asChild>
                  <Link href="/a-livrer" onClick={() => setIsMobileMenuOpen(false)}>
                    <PackageCheck className="h-4 w-4 me-2" />
                    {t.toDeliver}
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm font-medium h-11" asChild>
                  <Link href="/favoris" onClick={() => setIsMobileMenuOpen(false)}>
                    <Heart className="h-4 w-4 me-2" />
                    {t.favorites}
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm font-medium h-11" asChild>
                  <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <LayoutDashboard className="h-4 w-4 me-2" />
                    {t.dashboard}
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm font-medium h-11" asChild>
                  <Link href="/dashboard#services" onClick={() => setIsMobileMenuOpen(false)}>
                    <Briefcase className="h-4 w-4 me-2" />
                    {t.myServices}
                  </Link>
                </Button>
                {isAdmin && (
                  <Button variant="ghost" className="w-full justify-start text-sm font-medium h-11 text-primary" asChild>
                    <Link href="/admin/verifications" onClick={() => setIsMobileMenuOpen(false)}>
                      <ShieldCheck className="h-4 w-4 me-2" />
                      Admin
                    </Link>
                  </Button>
                )}
                <div className="h-px bg-border" />
                <Button variant="ghost" className="w-full justify-start text-sm font-medium h-11" asChild>
                  <Link href="/parametres" onClick={() => setIsMobileMenuOpen(false)}>
                    <Settings className="h-4 w-4 me-2" />
                    {t.settings}
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm font-medium h-11" asChild>
                  <Link href="/aide" onClick={() => setIsMobileMenuOpen(false)}>
                    <HelpCircle className="h-4 w-4 me-2" />
                    {t.helpSupport}
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm font-medium h-11 text-destructive hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 me-2" />
                  {t.logout}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="w-full justify-start text-sm font-medium h-11" asChild>
                  <Link href="/connexion" onClick={() => setIsMobileMenuOpen(false)}>{t.login}</Link>
                </Button>
                <Button className="w-full text-sm font-medium h-11 bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                  <Link href="/inscription" onClick={() => setIsMobileMenuOpen(false)}>{t.signup}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
