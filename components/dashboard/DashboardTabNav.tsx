"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"

export function DashboardTabNav() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab")

  const isGeral = !currentTab || currentTab === "geral"
  const isSecretaria = currentTab === "secretaria"

  return (
    <div className="border-b border-border px-6">
      <nav className="flex gap-0" aria-label="Dashboard tabs">
        <button
          onClick={() => router.push(pathname)}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            isGeral
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Visão Geral
        </button>
        <button
          onClick={() => router.push(`${pathname}?tab=secretaria`)}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            isSecretaria
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Por Secretaria
        </button>
      </nav>
    </div>
  )
}
