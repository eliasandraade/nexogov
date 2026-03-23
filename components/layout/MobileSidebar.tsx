"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Sidebar } from "./Sidebar"
import type { UserRole } from "@prisma/client"

interface MobileSidebarProps {
  userRole: UserRole
  userName: string
  secretariatName?: string | null
  pendingCount?: number
}

export function MobileSidebar({ userRole, userName, secretariatName, pendingCount = 0 }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 h-8 w-8 rounded-md flex items-center justify-center text-white shadow-md transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--sidebar)" }}
        aria-label="Abrir menu"
      >
        <Menu className="h-[15px] w-[15px]" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          {/* Sidebar container */}
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-64">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3.5 right-3 z-10 h-6 w-6 rounded-md flex items-center justify-center text-white/50 hover:text-white transition-colors"
              aria-label="Fechar menu"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div onClick={() => setOpen(false)}>
              <Sidebar
                userRole={userRole}
                userName={userName}
                secretariatName={secretariatName}
                pendingCount={pendingCount}
              />
            </div>
          </div>
        </>
      )}
    </>
  )
}
