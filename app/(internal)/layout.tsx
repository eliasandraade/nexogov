import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="min-h-screen flex">
      <Sidebar
        userRole={session.user.role}
        userName={session.user.name}
        secretariatName={session.user.secretariat?.name}
      />
      <main className="flex-1 ml-64 min-h-screen bg-background">
        {children}
      </main>
    </div>
  )
}
