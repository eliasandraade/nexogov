"use client"

import { useEffect } from "react"
import type { UserRole } from "@prisma/client"
import { getTourSteps } from "./tours"

interface Props {
  role: UserRole
  hasCompleted: boolean
}

export function OnboardingProvider({ role, hasCompleted }: Props) {
  useEffect(() => {
    if (hasCompleted) return

    let cancelled = false

    async function startTour() {
      // Inject driver.js CSS from public
      const existingLink = document.getElementById("driver-css")
      if (!existingLink) {
        const link = document.createElement("link")
        link.id = "driver-css"
        link.rel = "stylesheet"
        link.href = "/driver.css"
        document.head.appendChild(link)
      }

      // Dynamic import only runs in browser (inside useEffect)
      const { driver } = await import("driver.js")
      if (cancelled) return

      const steps = getTourSteps(role)

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
  }, [hasCompleted, role])

  return null
}
