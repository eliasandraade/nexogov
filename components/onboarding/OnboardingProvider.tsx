"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import type { UserRole } from "@prisma/client"
import { getTourSteps } from "./tours"
import "driver.js/dist/driver.css"

interface Props {
  role: UserRole
  hasCompleted: boolean
}

export function OnboardingProvider({ role, hasCompleted }: Props) {
  const router = useRouter()

  useEffect(() => {
    if (hasCompleted) return

    let cancelled = false

    async function startTour() {
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
          markCompleted()
        },
      })

      driverObj.drive()
    }

    async function markCompleted() {
      await fetch("/api/user/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      })
    }

    startTour()

    return () => {
      cancelled = true
    }
  }, [hasCompleted, role])

  return null
}
