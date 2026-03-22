import { Topbar } from "@/components/layout/Topbar"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { canManageUsers } from "@/lib/permissions"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils/format"
import { USER_ROLE_LABELS } from "@/lib/utils/labels"
import { UsersClient } from "@/components/users/UsersClient"

async function getUsers() {
  return prisma.user.findMany({
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

  const [users, secretariats] = await Promise.all([getUsers(), getSecretariats()])

  return (
    <div>
      <Topbar title="Usuários" subtitle={`${users.length} usuários cadastrados`} />
      <div className="p-6">
        <UsersClient users={users} secretariats={secretariats} />
      </div>
    </div>
  )
}
