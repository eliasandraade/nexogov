"use client"

import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs transition-colors"
      style={{ color: "var(--sidebar-muted)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = "var(--sidebar-accent)"
        ;(e.currentTarget as HTMLElement).style.color = "white"
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = ""
        ;(e.currentTarget as HTMLElement).style.color = "var(--sidebar-muted)"
      }}
      title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      {isDark ? <Sun className="h-3.5 w-3.5 flex-shrink-0" /> : <Moon className="h-3.5 w-3.5 flex-shrink-0" />}
      {isDark ? "Modo claro" : "Modo escuro"}
    </button>
  )
}
