import { Topbar } from "@/components/layout/Topbar"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { canManageOrganizationalStructure } from "@/lib/permissions"
import { OrgansClient } from "@/components/organs/OrgansClient"

async function getData() {
  const [organs, secretariats] = await Promise.all([
    prisma.organ.findMany({
      orderBy: { name: "asc" },
      include: {
        secretariat: { select: { name: true, code: true } },
        _count: { select: { sectors: true, users: true } },
      },
    }),
    prisma.secretariat.findMany({
      where: { active: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    }),
  ])
  return { organs, secretariats }
}

export default async function OrgansPage() {
  const session = await auth()
  if (!session || !canManageOrganizationalStructure(session.user.role)) redirect("/dashboard")

  const { organs, secretariats } = await getData()

  return (
    <div>
      <Topbar title="Órgãos" subtitle={`${organs.length} órgãos cadastrados`} />
      <div className="p-6">
        <OrgansClient organs={organs} secretariats={secretariats} />
      </div>
    </div>
  )
}
