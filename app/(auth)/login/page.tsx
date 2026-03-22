import { LoginForm } from "@/components/forms/LoginForm"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Entrar — NexoGov",
}

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect("/dashboard")

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1e3a5f] flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-semibold tracking-wide">NexoGov</span>
          </div>
        </div>

        <div className="space-y-6">
          <blockquote className="text-3xl font-light leading-relaxed text-white/90">
            &ldquo;Conectando processos.
            <br />
            Transformando gestão.&rdquo;
          </blockquote>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm">
            Sistema institucional de tramitação processual municipal.
            Rastreabilidade completa, controle seguro de documentos e dados
            orientados à tomada de decisão.
          </p>
        </div>

        <div className="text-white/40 text-xs">
          © {new Date().getFullYear()} NexoGov · Sistema de Gestão Municipal
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">N</span>
            </div>
            <span className="text-lg font-semibold text-[#1e3a5f]">NexoGov</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">
              Acesso ao sistema
            </h1>
            <p className="text-sm text-muted-foreground">
              Informe suas credenciais institucionais para continuar.
            </p>
          </div>

          <LoginForm />

          <p className="text-center text-xs text-muted-foreground">
            Acesso restrito a servidores autorizados.
            <br />
            Em caso de dúvida, contate o administrador do sistema.
          </p>
        </div>
      </div>
    </div>
  )
}
