"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Menu, X, Globe, LogOut, LayoutDashboard, MessageSquare, ShoppingBag, PackageCheck, ChevronDown, User as UserIcon, Settings, HelpCircle, Briefcase } from "lucide-react"
import { NotificationsBell } from "@/components/notifications-bell"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  const { lang, toggleLang } = useLanguage()
  const t = translations[lang].nav
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [unreadCount, setUnreadCount] = useState(0)
  const lastScrollY = useRef(0)

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm"
          : "bg-white/90 backdrop-blur-md"
      } ${isHidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/">
            <span style={{fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', fontWeight: '700', letterSpacing: '-0.5px'}}>
              <span style={{color: '#DC2626'}}>W</span>
              <span style={{position: 'relative', display: 'inline-block'}}>
                <span style={{position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: '#DC2626', lineHeight: 1}}>ّ</span>
                s
              </span>
              <span style={{color: '#1A1A1A'}}>lni</span>
            </span>
          </Link>

          {/* Search bar (md+) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full group">
              <button
                type="button"
                aria-label={t.search}
                onClick={() => handleSearch(desktopSearchRef.current?.value ?? "")}
                className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-all duration-150 hover:text-primary hover:scale-110"
              >
                <Search className="h-4 w-4" />
              </button>
              <input
                ref={desktopSearchRef}
                type="text"
                placeholder={t.search}
                onKeyDown={onDesktopSearchKey}
                className="w-full h-10 ps-10 pe-4 rounded-full border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Desktop nav (lg+) */}
          <div className="hidden lg:flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-sm font-medium" asChild>
              <Link href="/services">{t.explore}</Link>
            </Button>

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
                  <Link href="/dashboard#commandes-a-livrer">
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

          {/* Bell (mobile only — desktop bell is inside the desktop nav) + mobile menu button */}
          <div className="flex items-center gap-2">
            {user && <span className="lg:hidden"><NotificationsBell user={user} /></span>}
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
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          isMobileMenuOpen ? "max-h-[calc(100dvh-4rem)]" : "max-h-0"
        }`}
        style={{ overflowY: isMobileMenuOpen ? "auto" : "hidden" }}
      >
        <div className="px-4 py-4 space-y-2 bg-background/95 backdrop-blur-md border-t border-border">

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

          <Button variant="ghost" className="w-full justify-start text-sm font-medium" asChild>
            <Link href="/services">{t.explore}</Link>
          </Button>

          <div className="h-px bg-border" />

          {/* Language toggle mobile */}
          <button
            onClick={toggleLang}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted text-sm font-medium transition-colors"
          >
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className={lang === "fr" ? "text-foreground" : "text-muted-foreground"}>{t.french}</span>
            <span className="text-muted-foreground">/</span>
            <span className={lang === "ar" ? "text-foreground" : "text-muted-foreground"}>{t.arabic}</span>
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
                <Link href={`/profil/${user.id}`}>
                  <UserIcon className="h-4 w-4 me-2" />
                  {t.myProfile}
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm font-medium" asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4 me-2" />
                  {t.dashboard}
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm font-medium" asChild>
                <Link href="/commandes">
                  <ShoppingBag className="h-4 w-4 me-2" />
                  {t.orders}
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm font-medium" asChild>
                <Link href="/dashboard#commandes-a-livrer">
                  <PackageCheck className="h-4 w-4 me-2" />
                  {t.toDeliver}
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm font-medium" asChild>
                <Link href="/dashboard#services">
                  <Briefcase className="h-4 w-4 me-2" />
                  {t.myServices}
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm font-medium" asChild>
                <Link href="/messages" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {t.messages}
                  {unreadCount > 0 && (
                    <span className="ms-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm font-medium" asChild>
                <Link href="/parametres">
                  <Settings className="h-4 w-4 me-2" />
                  {t.settings}
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm font-medium" asChild>
                <Link href="/aide">
                  <HelpCircle className="h-4 w-4 me-2" />
                  {t.helpSupport}
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm font-medium text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 me-2" />
                {t.logout}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="w-full justify-start text-sm font-medium" asChild>
                <Link href="/connexion">{t.login}</Link>
              </Button>
              <Button className="w-full text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                <Link href="/inscription">{t.signup}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
