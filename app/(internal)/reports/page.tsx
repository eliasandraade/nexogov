import { Topbar } from "@/components/layout/Topbar"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { canViewDashboard } from "@/lib/permissions"
import { prisma } from "@/lib/prisma"
import { ReportsClient } from "@/components/reports/ReportsClient"

export default async function ReportsPage() {
  const session = await auth()
  if (!session || !canViewDashboard(session.user.role)) redirect("/dashboard")

  const secretariats = await prisma.secretariat.findMany({
    select: { id: true, name: true, code: true },
    orderBy: { name: "asc" },
  })

  return (
    <div>
      <Topbar title="Relatórios" subtitle="Exportação e análise de dados" />
      <div className="p-6">
        <ReportsClient secretariats={secretariats} />
      </div>
    </div>
  )
}
