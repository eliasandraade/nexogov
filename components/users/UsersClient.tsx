"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils/format"
import { USER_ROLE_LABELS } from "@/lib/utils/labels"
import { UserModal } from "./UserModal"
import { Plus, Pencil, PowerOff, Power } from "lucide-react"
import { toast } from "sonner"
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

interface UsersClientProps {
  users: User[]
  secretariats: Secretariat[]
  callerRole?: UserRole
  callerSecretariatId?: string
}

export function UsersClient({ users, secretariats, callerRole, callerSecretariatId }: UsersClientProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  function openCreate() { setEditingUser(null); setModalOpen(true) }
  function openEdit(u: User) { setEditingUser(u); setModalOpen(true) }

  async function handleToggleActive(u: User) {
    setTogglingId(u.id)
    try {
      const res = await fetch(`/api/users/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !u.active }),
      })
      if (!res.ok) {
        toast.error("Erro ao atualizar status do usuário.")
        return
      }
      toast.success(u.active ? "Usuário inativado." : "Usuário ativado.")
      router.refresh()
    } catch {
      toast.error("Erro de conexão.")
    } finally {
      setTogglingId(null)
    }
  }

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
              <TableHead className="w-20"></TableHead>
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
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(u)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={togglingId === u.id}
                      onClick={() => handleToggleActive(u)}
                      title={u.active ? "Inativar usuário" : "Ativar usuário"}
                    >
                      {u.active
                        ? <PowerOff className="h-3.5 w-3.5 text-destructive" />
                        : <Power className="h-3.5 w-3.5 text-green-600" />
                      }
                    </Button>
                  </div>
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
        callerRole={callerRole}
        callerSecretariatId={callerSecretariatId}
      />
    </>
  )
}
