"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SecretariatModal } from "./SecretariatModal"
import { Plus, Pencil } from "lucide-react"

interface Secretariat {
  id: string
  name: string
  code: string
  description?: string | null
  active: boolean
  _count: { organs: number; sectors: number; users: number }
}

export function SecretariatsClient({ secretariats }: { secretariats: Secretariat[] }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSecretariat, setEditingSecretariat] = useState<Secretariat | null>(null)

  function openCreate() { setEditingSecretariat(null); setModalOpen(true) }
  function openEdit(s: Secretariat) { setEditingSecretariat(s); setModalOpen(true) }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nova Secretaria
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-28">Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="w-20 text-center">Órgãos</TableHead>
              <TableHead className="w-20 text-center">Setores</TableHead>
              <TableHead className="w-24 text-center">Usuários</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {secretariats.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <span className="font-mono text-xs font-semibold text-primary">{s.code}</span>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    {s.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-[400px]">{s.description}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center text-sm">{s._count.organs}</TableCell>
                <TableCell className="text-center text-sm">{s._count.sectors}</TableCell>
                <TableCell className="text-center text-sm">{s._count.users}</TableCell>
                <TableCell>
                  <Badge variant={s.active ? "success" : "secondary"} className="text-xs">
                    {s.active ? "Ativa" : "Inativa"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <SecretariatModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        secretariat={editingSecretariat}
      />
    </>
  )
}
