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
      <div
        className="hidden lg:flex lg:w-[44%] relative flex-col justify-between p-12 text-white overflow-hidden"
        style={{ background: "linear-gradient(145deg, #1e3f6e 0%, #112240 50%, #0a1929 100%)" }}
      >
        {/* Decorative radial glows */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)" }}
        />

        {/* Logo */}
        <div className="relative z-10">
          {/* position:absolute is immune to layout reflow caused by client hydration */}
          <div style={{ width: 220, height: 55, overflow: "hidden", position: "relative", flexShrink: 0 }}>
            <img
              src="/logos/logo-dark.png"
              alt="NexoGov"
              style={{ position: "absolute", width: 220, height: 220, top: -82, left: 0 }}
            />
          </div>
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
          <div className="lg:hidden">
            <div style={{ width: 180, height: 45, overflow: "hidden", position: "relative", flexShrink: 0 }}>
              <img
                src="/logos/logo-light.png"
                alt="NexoGov"
                style={{ position: "absolute", width: 180, height: 180, top: -67, left: 0 }}
              />
            </div>
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
