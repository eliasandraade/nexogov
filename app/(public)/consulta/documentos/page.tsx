import { DocumentConsultaForm } from "@/components/forms/DocumentConsultaForm"

export const metadata = {
  title: "Consulta de Documentos — NexoGov",
  description: "Acesse os documentos do seu protocolo informando o número e a senha.",
}

export default function DocumentosPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <header className="bg-[#1e3a5f] text-white py-4 px-6 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center">
            <span className="font-bold text-sm">N</span>
          </div>
          <div>
            <p className="font-semibold text-sm">NexoGov</p>
            <p className="text-white/60 text-xs">Acesso a Documentos</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Acesso a Documentos
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Informe o número do protocolo e a senha para visualizar os documentos
            vinculados. Todo acesso é registrado para fins de auditoria.
          </p>
        </div>

        <DocumentConsultaForm />
      </main>

      <footer className="mt-auto border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} NexoGov · Todo acesso é registrado e auditado.
      </footer>
    </div>
  )
}
