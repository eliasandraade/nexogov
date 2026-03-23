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
    <div className="min-h-screen flex bg-background">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[44%] relative flex-col justify-between p-12 text-white overflow-hidden"
        style={{ background: "linear-gradient(145deg, #1e3f6e 0%, #112240 50%, #0a1929 100%)" }}
      >
        {/* Subtle decorative circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
        />
        <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/[0.12] rounded-lg flex items-center justify-center ring-1 ring-white/10">
            <span className="text-white font-bold text-base tracking-tight">N</span>
          </div>
          <span className="text-lg font-semibold tracking-wide text-white">NexoGov</span>
        </div>

        {/* Main content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-5">
            <div className="w-8 h-[2px] bg-white/30 rounded-full" />
            <p className="text-2xl font-light leading-snug text-white/90 tracking-[-0.01em]">
              Conectando processos.<br />
              Transformando gestão.
            </p>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              Sistema institucional de tramitação processual municipal.
              Rastreabilidade completa, documentos controlados e dados
              orientados à decisão.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {["Tramitação digital", "Auditoria completa", "Dados para gestão"].map((tag) => (
              <span
                key={tag}
                className="text-[11px] text-white/50 border border-white/10 rounded-full px-3 py-1 tracking-wide"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-white/30 text-xs">
          © {new Date().getFullYear()} NexoGov · Sistema de Gestão Municipal
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-[360px] space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--primary)" }}>
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-base font-semibold text-foreground">NexoGov</span>
          </div>

          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold text-foreground tracking-[-0.01em]">
              Acesso ao sistema
            </h1>
            <p className="text-sm text-muted-foreground">
              Informe suas credenciais institucionais para continuar.
            </p>
          </div>

          <LoginForm />

          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            Acesso restrito a servidores autorizados.
            <br />
            Em caso de dúvida, contate o administrador do sistema.
          </p>
        </div>
      </div>
    </div>
  )
}
