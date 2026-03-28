"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import type { UserRole } from "@prisma/client"
import { getTourSteps } from "./tours"

interface Props {
  role: UserRole
  hasCompleted: boolean
}

export function OnboardingProvider({ role, hasCompleted }: Props) {
  const pathname = usePathname()

  useEffect(() => {
    if (hasCompleted) return

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
          fetch("/api/user/onboarding", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: true }),
          })
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
