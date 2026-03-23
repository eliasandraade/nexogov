"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Sidebar } from "./Sidebar"
import type { UserRole } from "@prisma/client"

interface MobileSidebarProps {
  userRole: UserRole
  userName: string
  secretariatName?: string | null
}

export function MobileSidebar({ userRole, userName, secretariatName }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 h-8 w-8 rounded-md flex items-center justify-center bg-[#1e3a5f] text-white shadow-md"
        aria-label="Abrir menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setOpen(false)}
          />
          {/* Sidebar container */}
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-64">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-10 h-6 w-6 rounded flex items-center justify-center text-white/60 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <div onClick={() => setOpen(false)}>
              <Sidebar
                userRole={userRole}
                userName={userName}
                secretariatName={secretariatName}
              />
            </div>
          </div>
        </>
      )}
    </>
  )
}
