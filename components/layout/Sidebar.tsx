"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  ClipboardList,
  LogOut,
  FolderOpen,
  BarChart3,
  Activity,
  UserCircle,
  Network,
  Inbox,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils/cn"
import type { UserRole } from "@prisma/client"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles?: UserRole[]
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN_SISTEMA", "DEV", "ADMIN", "GESTOR", "PREFEITO", "VICE_PREFEITO", "SECRETARIO"],
  },
  {
    label: "Protocolos",
    href: "/protocols",
    icon: FileText,
  },
  {
    label: "Minha Fila",
    href: "/queue",
    icon: Inbox,
    roles: undefined,
  },
  {
    label: "Secretarias",
    href: "/secretariats",
    icon: Building2,
    roles: ["ADMIN_SISTEMA", "DEV", "ADMIN"],
  },
  {
    label: "Órgãos",
    href: "/organs",
    icon: Network,
    roles: ["ADMIN_SISTEMA", "DEV", "ADMIN"],
  },
  {
    label: "Setores",
    href: "/sectors",
    icon: FolderOpen,
    roles: ["ADMIN_SISTEMA", "DEV", "ADMIN"],
  },
  {
    label: "Usuários",
    href: "/users",
    icon: Users,
    roles: ["ADMIN_SISTEMA", "DEV", "ADMIN"],
  },
  {
    label: "Métricas",
    href: "/metrics",
    icon: Activity,
    roles: ["ADMIN_SISTEMA", "DEV", "ADMIN", "GESTOR", "PREFEITO", "VICE_PREFEITO", "SECRETARIO"],
  },
  {
    label: "Relatórios",
    href: "/reports",
    icon: BarChart3,
    roles: ["ADMIN_SISTEMA", "DEV", "ADMIN", "GESTOR", "PREFEITO", "VICE_PREFEITO", "SECRETARIO"],
  },
  {
    label: "Auditoria",
    href: "/audit",
    icon: ClipboardList,
    roles: ["ADMIN_SISTEMA", "DEV", "ADMIN", "GESTOR", "PREFEITO", "VICE_PREFEITO"],
  },
  {
    label: "Meu Perfil",
    href: "/profile",
    icon: UserCircle,
  },
]

interface SidebarProps {
  userRole: UserRole
  userName: string
  secretariatName?: string | null
  pendingCount?: number
}

export function Sidebar({ userRole, userName, secretariatName, pendingCount = 0 }: SidebarProps) {
  const pathname = usePathname()

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  )

  const initials = userName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-sidebar flex flex-col">
      {/* Logo */}
      <div
        className="flex items-center px-5 py-[14px]"
        style={{ borderBottom: "1px solid var(--sidebar-border)" }}
      >
        <Link href="/dashboard" className="flex items-center">
          {/* 2048×2048 canvas — zoom in on center content */}
          <div style={{ width: 180, height: 36, overflow: "hidden", flexShrink: 0 }}>
            <img
              src="/logos/logo-dark.png"
              alt="NexoGov"
              style={{ width: 180, height: 180, display: "block", marginTop: -72 }}
            />
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === "/protocols"
              ? pathname.startsWith("/protocols")
              : pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all relative group",
                isActive ? "text-white font-medium" : ""
              )}
              style={
                isActive
                  ? { backgroundColor: "var(--sidebar-active)", color: "white" }
                  : { color: "var(--sidebar-muted)" }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "var(--sidebar-accent)"
                  ;(e.currentTarget as HTMLElement).style.color = "white"
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = ""
                  ;(e.currentTarget as HTMLElement).style.color = "var(--sidebar-muted)"
                }
              }}
            >
              {/* Active left accent */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                  style={{ backgroundColor: "var(--sidebar-active-accent)" }}
                />
              )}
              <Icon className="h-[15px] w-[15px] flex-shrink-0" />
              <span className="flex-1 leading-none">{item.label}</span>
              {item.href === "/queue" && pendingCount > 0 && !isActive && (
                <span
                  className="text-[10px] font-semibold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-tight text-white"
                  style={{ backgroundColor: "var(--sidebar-active)" }}
                >
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User + footer */}
      <div className="px-3 pb-3 pt-2 space-y-1" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
        {/* User info */}
        <div
          className="flex items-center gap-2.5 px-3 py-2 rounded-md"
          style={{ backgroundColor: "var(--sidebar-accent)" }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[11px] font-bold"
            style={{ backgroundColor: "var(--sidebar-active)" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate leading-none">{userName}</p>
            {secretariatName && (
              <p className="text-[11px] truncate leading-none mt-0.5" style={{ color: "var(--sidebar-muted)" }}>
                {secretariatName}
              </p>
            )}
          </div>
        </div>

        <ThemeToggle />

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
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
        >
          <LogOut className="h-3.5 w-3.5 flex-shrink-0" />
          Sair do sistema
        </button>
      </div>
    </aside>
  )
}
