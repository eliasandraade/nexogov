"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  protocols: "Protocolos",
  novo: "Novo Protocolo",
  secretariats: "Secretarias",
  organs: "Órgãos",
  sectors: "Setores",
  users: "Usuários",
  audit: "Auditoria",
  metrics: "Métricas",
  reports: "Relatórios",
  profile: "Meu Perfil",
  print: "Impressão",
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length <= 1) return null

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/")
    const label = SEGMENT_LABELS[seg] ?? (seg.length > 20 ? `${seg.slice(0, 8)}...` : seg)
    const isLast = i === segments.length - 1
    return { href, label, isLast }
  })

  return (
    <nav className="flex items-center gap-1 text-xs text-muted-foreground" aria-label="Breadcrumb">
      <Link href="/dashboard" className="hover:text-foreground transition-colors">
        <Home className="h-3 w-3" />
      </Link>
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 opacity-40" />
          {c.isLast ? (
            <span className="font-medium text-foreground">{c.label}</span>
          ) : (
            <Link href={c.href} className="hover:text-foreground transition-colors">
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
