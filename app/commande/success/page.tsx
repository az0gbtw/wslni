import Link from "next/link"
import { CheckCircle2, ArrowLeft, ClipboardList } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"

export default function CommandeSuccessPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full animate-fade-in-up">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>

          <h1 className="text-2xl font-black text-foreground mb-3">
            Commande confirmée !
          </h1>

          <p className="text-base text-muted-foreground mb-2">
            Votre commande a bien été transmise au freelance.
          </p>

          <p className="text-sm text-muted-foreground mb-8">
            Elle est actuellement{" "}
            <span className="font-semibold text-amber-600">en attente de traitement</span>.
            {" "}Vous serez notifié dès que le freelance acceptera votre demande.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline" className="rounded-xl font-semibold">
              <Link href="/services">
                <ArrowLeft className="h-4 w-4 me-2" />
                Retour aux services
              </Link>
            </Button>
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl"
            >
              <Link href="/commandes" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Voir mes commandes
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
