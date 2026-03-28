"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import type { UserRole } from "@prisma/client"
import { getTourSteps } from "./tours"

const PAGE_TOUR_KEYS: Record<string, string> = {
  "/dashboard": "onboarding:dashboard",
  "/protocols": "onboarding:protocols",
}

function getPageTourKey(pathname: string): string | null {
  if (PAGE_TOUR_KEYS[pathname]) return PAGE_TOUR_KEYS[pathname]
  if (pathname.startsWith("/protocols/") && pathname !== "/protocols/novo") {
    return "onboarding:protocol-detail"
  }
  return null
}

interface Props {
  role: UserRole
  hasCompleted: boolean
}

export function OnboardingProvider({ role, hasCompleted }: Props) {
  const pathname = usePathname()

  useEffect(() => {
    const pageTourKey = getPageTourKey(pathname)

    if (pageTourKey) {
      if (localStorage.getItem(pageTourKey)) return
    } else {
      if (hasCompleted) return
    }

    let cancelled = false

    async function startTour() {
      const existingLink = document.getElementById("driver-css")
      if (!existingLink) {
        const link = document.createElement("link")
        link.id = "driver-css"
        link.rel = "stylesheet"
        link.href = "/driver.css"
        document.head.appendChild(link)
      }

      const { driver } = await import("driver.js")
      if (cancelled) return

      const steps = getTourSteps(role, pathname)

      const driverObj = driver({
        showProgress: true,
        progressText: "{{current}} de {{total}}",
        nextBtnText: "Próximo",
        prevBtnText: "Anterior",
        doneBtnText: "Concluir",
        allowClose: true,
        steps,
        onDestroyStarted: () => {
          driverObj.destroy()
          if (pageTourKey) {
            localStorage.setItem(pageTourKey, "true")
          } else {
            fetch("/api/user/onboarding", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ completed: true }),
            })
          }
        },
      })

      driverObj.drive()
    }

    startTour()

    return () => {
      cancelled = true
    }
  }, [hasCompleted, role, pathname])

  return null
}
