import { Suspense } from "react"
import { ConsultaForm } from "@/components/forms/ConsultaForm"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export const metadata = {
  title: "Consulta de Protocolos — NexoGov",
  description: "Consulte o andamento do seu protocolo pelo número.",
}

export default function ConsultaPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white py-3 px-6 shadow-sm flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div style={{ width: 120, height: 30, overflow: "hidden", position: "relative", flexShrink: 0 }}>
              <img
                src="/logos/logo-dark.png"
                alt="NexoGov"
                style={{ position: "absolute", width: 120, height: 120, top: -44, left: 0 }}
              />
            </div>
            <span className="text-white/40 text-xs hidden sm:block">·</span>
            <p className="text-white/70 text-xs hidden sm:block">Consulta de Protocolos</p>
          </div>
          <Link
            href="/login"
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            Acesso ao sistema →
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Consulta de Protocolo
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Informe o número do protocolo para acompanhar o andamento e as
            movimentações registradas no sistema.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <ConsultaForm />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-5 text-center text-xs text-muted-foreground flex-shrink-0">
        © {new Date().getFullYear()} NexoGov · Sistema de Tramitação Municipal
      </footer>
    </div>
  )
}
