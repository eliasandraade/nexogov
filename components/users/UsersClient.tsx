"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils/format"
import { USER_ROLE_LABELS } from "@/lib/utils/labels"
import { UserModal } from "./UserModal"
import { Plus, Pencil } from "lucide-react"
import type { UserRole } from "@prisma/client"

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  active: boolean
  createdAt: Date
  secretariat: { name: string; code: string } | null
  organ: { name: string } | null
  sector: { name: string } | null
}

interface Secretariat { id: string; name: string; code: string }

export function UsersClient({ users, secretariats }: { users: User[]; secretariats: Secretariat[] }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  function openCreate() { setEditingUser(null); setModalOpen(true) }
  function openEdit(u: User) { setEditingUser(u); setModalOpen(true) }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Secretaria</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead className="w-20 text-center">Status</TableHead>
              <TableHead className="w-32">Criado em</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <p className="text-sm font-medium">{u.name}</p>
                </TableCell>
                <TableCell>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{USER_ROLE_LABELS[u.role]}</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-mono">{u.secretariat?.code ?? "—"}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">{u.sector?.name ?? u.organ?.name ?? "—"}</span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={u.active ? "success" : "secondary"} className="text-xs">
                    {u.active ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</span>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(u)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        user={editingUser}
      />
    </>
  )
}
