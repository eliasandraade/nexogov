import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { MobileSidebar } from "@/components/layout/MobileSidebar"

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          userRole={session.user.role}
          userName={session.user.name}
          secretariatName={session.user.secretariat?.name}
        />
      </div>

      {/* Mobile sidebar */}
      <MobileSidebar
        userRole={session.user.role}
        userName={session.user.name}
        secretariatName={session.user.secretariat?.name}
      />

      <main className="flex-1 lg:ml-64 min-h-screen bg-background">
        {children}
      </main>
    </div>
  )
}
