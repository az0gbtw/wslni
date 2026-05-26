import Link from "next/link"
import { ArrowLeft, Clock } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"

interface PlaceholderPageProps {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary/30 pt-16">
        <div className="text-center px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Bientôt disponible</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
            {title}
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
            Cette page est en cours de construction. Revenez bientôt&nbsp;!
          </p>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-2 border-foreground/20 hover:border-primary hover:text-primary transition-all duration-300"
          >
            <Link href="/">
              <ArrowLeft className="me-2 h-5 w-5 rtl:rotate-180" />
              Retour à l&apos;accueil
            </Link>
          </Button>
        </div>
      </section>
      <Footer />
    </main>
  )
}
