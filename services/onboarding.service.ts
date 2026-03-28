import { prisma } from "@/lib/prisma"

export async function completeOnboarding(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { hasCompletedOnboarding: true },
  })
}

export async function resetOnboarding(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { hasCompletedOnboarding: false },
  })
}
