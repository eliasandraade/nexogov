import { Topbar } from "@/components/layout/Topbar"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { canManageUsers, isSecretariatScoped } from "@/lib/permissions"
import { UsersClient } from "@/components/users/UsersClient"

async function getUsers(secretariatId?: string | null) {
  return prisma.user.findMany({
    where: secretariatId ? { secretariatId } : undefined,
    orderBy: { name: "asc" },
    select: {
      id: true, name: true, email: true, role: true, active: true, createdAt: true,
      secretariat: { select: { name: true, code: true } },
      organ: { select: { name: true } },
      sector: { select: { name: true } },
    },
  })
}

async function getSecretariats() {
  return prisma.secretariat.findMany({
    where: { active: true },
    select: { id: true, name: true, code: true },
    orderBy: { name: "asc" },
  })
}

export default async function UsersPage() {
  const session = await auth()
  if (!session || !canManageUsers(session.user.role)) redirect("/dashboard")

  const isScoped = isSecretariatScoped(session.user.role)
  const callerSecretariatId = session.user.secretariatId ?? undefined

  const [users, secretariats] = await Promise.all([
    getUsers(isScoped ? callerSecretariatId : undefined),
    getSecretariats(),
  ])

  return (
    <div>
      <Topbar title="Usuários" subtitle={`${users.length} usuários cadastrados`} />
      <div className="p-6">
        <UsersClient
          users={users}
          secretariats={secretariats}
          callerRole={session.user.role}
          callerSecretariatId={callerSecretariatId}
        />
      </div>
    </div>
  )
}
