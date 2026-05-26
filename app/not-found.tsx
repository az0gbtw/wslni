import Link from "next/link"
import { Navbar } from "@/components/navbar"

export default function NotFound() {
  return (
    <>
      <Navbar />

      {/* Subtle dot-grid background — CSS only */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundColor: "#FAFAF8",
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(220,38,38,0.08) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />

      <main className="flex min-h-screen flex-col items-center justify-center px-4 pt-16">
        <div className="mx-auto max-w-md w-full text-center">
          {/* Large 404 */}
          <p
            className="text-8xl font-black text-red-600 leading-none select-none"
            style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}
            aria-hidden="true"
          >
            404
          </p>

          <div className="mt-6 mb-6 h-px w-16 bg-red-600/30 mx-auto" />

          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Page introuvable
          </h1>

          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            La page que vous cherchez n&apos;existe pas ou a été déplacée.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-6 py-3 transition-colors duration-150 w-full sm:w-auto"
            >
              Retour à l&apos;accueil
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center rounded-xl border border-red-600 text-red-600 hover:bg-red-50 text-sm font-semibold px-6 py-3 transition-colors duration-150 w-full sm:w-auto"
            >
              Explorer les services
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
