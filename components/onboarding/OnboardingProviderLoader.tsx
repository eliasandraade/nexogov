"use client"

import dynamic from "next/dynamic"
import type { UserRole } from "@prisma/client"

const OnboardingProvider = dynamic(
  () => import("./OnboardingProvider").then((m) => m.OnboardingProvider),
  { ssr: false }
)

interface Props {
  role: UserRole
  hasCompleted: boolean
}

export function OnboardingProviderLoader({ role, hasCompleted }: Props) {
  return <OnboardingProvider role={role} hasCompleted={hasCompleted} />
}
