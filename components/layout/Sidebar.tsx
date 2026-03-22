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
  ChevronRight,
  FolderOpen,
  BarChart3,
  Activity,
  UserCircle,
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
    roles: ["ADMIN", "GESTOR"],
  },
  {
    label: "Protocolos",
    href: "/protocols",
    icon: FileText,
  },
  {
    label: "Secretarias",
    href: "/secretariats",
    icon: Building2,
    roles: ["ADMIN"],
  },
  {
    label: "Órgãos",
    href: "/organs",
    icon: FolderOpen,
    roles: ["ADMIN"],
  },
  {
    label: "Setores",
    href: "/sectors",
    icon: FolderOpen,
    roles: ["ADMIN"],
  },
  {
    label: "Usuários",
    href: "/users",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    label: "Métricas",
    href: "/metrics",
    icon: Activity,
    roles: ["ADMIN", "GESTOR"],
  },
  {
    label: "Relatórios",
    href: "/reports",
    icon: BarChart3,
    roles: ["ADMIN", "GESTOR"],
  },
  {
    label: "Auditoria",
    href: "/audit",
    icon: ClipboardList,
    roles: ["ADMIN", "GESTOR"],
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
}

export function Sidebar({ userRole, userName, secretariatName }: SidebarProps) {
  const pathname = usePathname()

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  )

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-[#1e3a5f] text-white flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center flex-shrink-0">
          <span className="font-bold text-sm">N</span>
        </div>
        <div>
          <p className="font-semibold text-sm leading-none">NexoGov</p>
          <p className="text-white/50 text-xs mt-0.5">Gestão Municipal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
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
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors group",
                isActive
                  ? "bg-white/15 text-white font-medium"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="h-3 w-3 opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* User info */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{userName}</p>
            {secretariatName && (
              <p className="text-xs text-white/50 truncate">{secretariatName}</p>
            )}
          </div>
        </div>
        <ThemeToggle />
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sair do sistema
        </button>
      </div>
    </aside>
  )
}
