"use client"

import { useEffect } from "react"
import { driver } from "driver.js"
import type { UserRole } from "@prisma/client"
import { getTourSteps } from "./tours"

interface Props {
  role: UserRole
  hasCompleted: boolean
}

export function OnboardingProvider({ role, hasCompleted }: Props) {
  useEffect(() => {
    if (hasCompleted) return

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
  }, [hasCompleted, role])

  return null
}
