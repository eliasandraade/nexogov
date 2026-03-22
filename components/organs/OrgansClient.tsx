"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { OrganModal } from "./OrganModal"
import { Plus, Pencil } from "lucide-react"

interface Organ {
  id: string
  name: string
  code: string
  description?: string | null
  active: boolean
  secretariatId: string
  secretariat: { name: string; code: string }
  _count: { sectors: number; users: number }
}

interface Secretariat { id: string; name: string; code: string }

export function OrgansClient({ organs, secretariats }: { organs: Organ[]; secretariats: Secretariat[] }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingOrgan, setEditingOrgan] = useState<Organ | null>(null)

  function openCreate() { setEditingOrgan(null); setModalOpen(true) }
  function openEdit(o: Organ) { setEditingOrgan(o); setModalOpen(true) }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Novo Órgão
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-28">Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Secretaria</TableHead>
              <TableHead className="w-20 text-center">Setores</TableHead>
              <TableHead className="w-20 text-center">Usuários</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                  Nenhum órgão cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              organs.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <span className="font-mono text-xs font-semibold text-primary">{o.code}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{o.name}</p>
                      {o.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-[300px]">{o.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono">{o.secretariat.code}</span>
                  </TableCell>
                  <TableCell className="text-center text-sm">{o._count.sectors}</TableCell>
                  <TableCell className="text-center text-sm">{o._count.users}</TableCell>
                  <TableCell>
                    <Badge variant={o.active ? "success" : "secondary"} className="text-xs">
                      {o.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(o)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <OrganModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        secretariats={secretariats}
        organ={editingOrgan}
      />
    </>
  )
}
