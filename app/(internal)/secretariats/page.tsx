import { Topbar } from "@/components/layout/Topbar"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Plus, Building2 } from "lucide-react"

export default async function SecretariatsPage() {
  const session = await auth()
  if (session?.user.role !== "ADMIN") redirect("/dashboard")

  const secretariats = await prisma.secretariat.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { organs: true, sectors: true, users: true } },
    },
  })

  return (
    <div>
      <Topbar title="Secretarias" subtitle={`${secretariats.length} secretarias cadastradas`} />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <Button size="sm">
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
