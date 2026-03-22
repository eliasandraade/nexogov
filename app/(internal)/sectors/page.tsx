import { Topbar } from "@/components/layout/Topbar"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { canManageOrganizationalStructure } from "@/lib/permissions"
import { SectorsClient } from "@/components/sectors/SectorsClient"

async function getData() {
  const [sectors, secretariats, organs] = await Promise.all([
    prisma.sector.findMany({
      orderBy: { name: "asc" },
      include: {
        secretariat: { select: { name: true, code: true } },
        organ: { select: { name: true } },
        _count: { select: { users: true } },
      },
    }),
    prisma.secretariat.findMany({
      where: { active: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    }),
    prisma.organ.findMany({
      where: { active: true },
      select: { id: true, name: true, secretariatId: true },
      orderBy: { name: "asc" },
    }),
  ])
  return { sectors, secretariats, organs }
}

export default async function SectorsPage() {
  const session = await auth()
  if (!session || !canManageOrganizationalStructure(session.user.role)) redirect("/dashboard")

  const { sectors, secretariats, organs } = await getData()

  return (
    <div>
      <Topbar title="Setores" subtitle={`${sectors.length} setores cadastrados`} />
      <div className="p-6">
        <SectorsClient sectors={sectors} secretariats={secretariats} organs={organs} />
      </div>
    </div>
  )
}
