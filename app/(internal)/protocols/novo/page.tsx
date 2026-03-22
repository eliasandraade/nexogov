import { Topbar } from "@/components/layout/Topbar"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { NewProtocolForm } from "@/components/forms/NewProtocolForm"
import { canCreateProtocol } from "@/lib/permissions"

async function getOrganizationalData() {
  const [secretariats, sectors] = await Promise.all([
    prisma.secretariat.findMany({
      where: { active: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    }),
    prisma.sector.findMany({
      where: { active: true },
      select: { id: true, name: true, code: true, secretariatId: true, organId: true },
      orderBy: { name: "asc" },
    }),
  ])
  return { secretariats, sectors }
}

export default async function NewProtocolPage() {
  const session = await auth()

  if (!session || !canCreateProtocol(session.user.role)) {
    redirect("/protocols")
  }

  const { secretariats, sectors } = await getOrganizationalData()

  return (
    <div>
      <Topbar title="Novo Protocolo" subtitle="Preencha os dados para registrar um novo protocolo" />
      <div className="p-6 max-w-3xl">
        <NewProtocolForm
          secretariats={secretariats}
          sectors={sectors}
          defaultSecretariatId={session.user.secretariatId ?? undefined}
          defaultSectorId={session.user.sectorId ?? undefined}
        />
      </div>
    </div>
  )
}
