"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SectorModal } from "./SectorModal"
import { Plus, Pencil } from "lucide-react"

interface Sector {
  id: string
  name: string
  code: string
  description?: string | null
  active: boolean
  secretariatId: string
  organId?: string | null
  secretariat: { name: string; code: string }
  organ: { name: string } | null
  _count: { users: number }
}

interface Secretariat { id: string; name: string; code: string }
interface Organ { id: string; name: string; secretariatId: string }

export function SectorsClient({
  sectors, secretariats, organs,
}: {
  sectors: Sector[]
  secretariats: Secretariat[]
  organs: Organ[]
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSector, setEditingSector] = useState<Sector | null>(null)

  function openCreate() { setEditingSector(null); setModalOpen(true) }
  function openEdit(s: Sector) { setEditingSector(s); setModalOpen(true) }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Novo Setor
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-28">Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Secretaria</TableHead>
              <TableHead>Órgão</TableHead>
              <TableHead className="w-24 text-center">Usuários</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sectors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                  Nenhum setor cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              sectors.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <span className="font-mono text-xs font-semibold text-primary">{s.code}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      {s.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-[300px]">{s.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono">{s.secretariat.code}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">{s.organ?.name ?? "—"}</span>
                  </TableCell>
                  <TableCell className="text-center text-sm">{s._count.users}</TableCell>
                  <TableCell>
                    <Badge variant={s.active ? "success" : "secondary"} className="text-xs">
                      {s.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <SectorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        secretariats={secretariats}
        organs={organs}
        sector={editingSector}
      />
    </>
  )
}
