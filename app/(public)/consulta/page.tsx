import { ConsultaForm } from "@/components/forms/ConsultaForm"

export const metadata = {
  title: "Consulta de Protocolos — NexoGov",
  description: "Consulte o andamento do seu protocolo pelo número.",
}

export default function ConsultaPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Header */}
      <header className="bg-[#1e3a5f] text-white py-4 px-6 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center">
            <span className="font-bold text-sm">N</span>
          </div>
          <div>
            <p className="font-semibold text-sm">NexoGov</p>
            <p className="text-white/60 text-xs">Consulta de Protocolos</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Consulta de Protocolo
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Informe o número do protocolo para acompanhar o andamento e as
            movimentações registradas no sistema.
          </p>
        </div>

        <ConsultaForm />
      </main>

      <footer className="mt-auto border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} NexoGov · Sistema de Tramitação Municipal
      </footer>
    </div>
  )
}
