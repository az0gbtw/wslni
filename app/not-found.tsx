import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

function ZelligeBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute -end-20 -top-20 w-[30rem] h-[30rem] opacity-8 animate-float"
        viewBox="0 0 200 200"
        fill="none"
      >
        <path
          d="M100 0L117.32 50L170.71 50L127.69 80.9L145.04 130.9L100 100L54.96 130.9L72.31 80.9L29.29 50L82.68 50L100 0Z"
          fill="currentColor"
          className="text-primary"
        />
      </svg>

      <svg
        className="absolute -start-12 bottom-16 w-72 h-72 opacity-8"
        viewBox="0 0 100 100"
        fill="none"
      >
        <rect
          x="10" y="10" width="80" height="80" rx="4"
          fill="currentColor"
          className="text-secondary"
          transform="rotate(45 50 50)"
        />
      </svg>

      <svg
        className="absolute start-[18%] top-[25%] w-20 h-20 opacity-10 animate-float"
        style={{ animationDelay: "2.5s" }}
        viewBox="0 0 200 200"
        fill="none"
      >
        <path
          d="M100 0L117.32 50L170.71 50L127.69 80.9L145.04 130.9L100 100L54.96 130.9L72.31 80.9L29.29 50L82.68 50L100 0Z"
          fill="currentColor"
          className="text-primary"
        />
      </svg>

      <svg
        className="absolute end-[12%] bottom-[28%] w-14 h-14 opacity-10 animate-float"
        style={{ animationDelay: "1.5s" }}
        viewBox="0 0 200 200"
        fill="none"
      >
        <path
          d="M100 0L117.32 50L170.71 50L127.69 80.9L145.04 130.9L100 100L54.96 130.9L72.31 80.9L29.29 50L82.68 50L100 0Z"
          fill="currentColor"
          className="text-primary"
        />
      </svg>

      <div className="absolute end-1/4 top-1/3 w-4 h-4 bg-primary/20 rotate-45 animate-pulse-subtle" />
      <div
        className="absolute start-1/3 top-1/4 w-3 h-3 bg-primary/30 rotate-45"
        style={{ animationDelay: "0.5s" }}
      />
      <div className="absolute end-1/3 bottom-1/4 w-5 h-5 border-2 border-primary/20 rotate-45" />
      <div
        className="absolute start-[22%] bottom-[32%] w-3 h-3 border-2 border-secondary/60 rotate-45 animate-pulse-subtle"
        style={{ animationDelay: "1.8s" }}
      />

      <div className="absolute top-0 start-0 w-full h-40 bg-gradient-to-b from-secondary/50 to-transparent" />
      <div className="absolute bottom-8 start-0 w-full h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  )
}

function ZelligeDivider() {
  return (
    <div className="w-full h-2 flex overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-full ${
            i % 4 === 0
              ? "bg-primary"
              : i % 4 === 1
              ? "bg-primary/70"
              : i % 4 === 2
              ? "bg-secondary"
              : "bg-primary/40"
          }`}
        />
      ))}
    </div>
  )
}

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary/30 overflow-hidden">
      <ZelligeBackground />

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-12 group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary shadow-md shadow-primary/30 group-hover:shadow-lg group-hover:shadow-primary/40 transition-shadow">
            <span className="text-xl font-bold text-primary-foreground">W</span>
          </div>
          <span className="text-2xl font-bold text-foreground">Wslni.ma</span>
        </Link>

        <div className="relative mb-4 w-full">
          <span className="block text-[8rem] sm:text-[11rem] leading-none font-black text-primary/8 select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Page introuvable
            </h1>
          </div>
        </div>

        <p className="text-base sm:text-lg text-muted-foreground mb-10 leading-relaxed">
          Oups&nbsp;! Cette page n'existe pas ou a été déplacée. Mais ne t'inquiète pas — des milliers de freelances talentueux t'attendent chez nous.
        </p>

        <Button
          asChild
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 px-8 py-6 text-base group"
        >
          <Link href="/">
            <Home className="me-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Retour à l'accueil
          </Link>
        </Button>
      </div>

      <div className="absolute bottom-0 start-0 w-full">
        <ZelligeDivider />
      </div>
    </main>
  )
}
