import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { MobileSidebar } from "@/components/layout/MobileSidebar"
import { OnboardingProviderLoader } from "@/components/onboarding/OnboardingProviderLoader"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { prisma } from "@/lib/prisma"

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const [currentUser, pendingCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { hasCompletedOnboarding: true },
    }),
    session.user.secretariat?.id
      ? prisma.protocol.count({
          where: {
            currentSecretariatId: session.user.secretariat.id,
            status: { notIn: ["CLOSED", "ARCHIVED"] },
          },
        })
      : Promise.resolve(0),
  ])

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          userRole={session.user.role}
          userName={session.user.name}
          secretariatName={session.user.secretariat?.name}
          pendingCount={pendingCount}
        />
      </div>

      {/* Mobile sidebar */}
      <MobileSidebar
        userRole={session.user.role}
        userName={session.user.name}
        secretariatName={session.user.secretariat?.name}
        pendingCount={pendingCount}
      />

      <main className="flex-1 lg:ml-64 min-h-screen bg-background">
        <PageWrapper>
          {children}
        </PageWrapper>
      </main>

      <OnboardingProviderLoader
        role={session.user.role}
        hasCompleted={currentUser?.hasCompletedOnboarding ?? true}
      />
    </div>
  )
}
