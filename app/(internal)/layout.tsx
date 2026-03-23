import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { MobileSidebar } from "@/components/layout/MobileSidebar"
import { prisma } from "@/lib/prisma"

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  // Pending protocols count for the user's secretariat (for sidebar badge)
  const pendingCount = session.user.secretariat?.id
    ? await prisma.protocol.count({
        where: {
          currentSecretariatId: session.user.secretariat.id,
          status: { notIn: ["CLOSED", "ARCHIVED"] },
        },
      })
    : 0

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
        {children}
      </main>
    </div>
  )
}
