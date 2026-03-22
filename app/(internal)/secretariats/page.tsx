import { Topbar } from "@/components/layout/Topbar"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { SecretariatsClient } from "@/components/secretariats/SecretariatsClient"

export default async function SecretariatsPage() {
  const session = await auth()
  if (!["ADMIN_SISTEMA", "DEV", "ADMIN"].includes(session?.user.role ?? "")) redirect("/dashboard")

  const secretariats = await prisma.secretariat.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { organs: true, sectors: true, users: true } },
    },
  })

  return (
    <div>
      <Topbar title="Secretarias" subtitle={`${secretariats.length} secretarias cadastradas`} />
      <div className="p-6">
        <SecretariatsClient secretariats={secretariats} />
      </div>
    </div>
  )
}
