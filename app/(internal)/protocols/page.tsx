import { Topbar } from "@/components/layout/Topbar"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/lib/utils/format"
import {
  PROTOCOL_STATUS_LABELS,
  PROTOCOL_STATUS_VARIANTS,
  PROTOCOL_PRIORITY_LABELS,
  PROTOCOL_PRIORITY_VARIANTS,
  PROTOCOL_TYPE_LABELS,
} from "@/lib/utils/labels"
import { Plus, Eye, AlertTriangle } from "lucide-react"
import { ProtocolFilters } from "@/components/protocols/ProtocolFilters"
import { protocolFiltersValidator } from "@/validators/protocol.validator"
import { isSecretariatScoped } from "@/lib/permissions"
import type { UserRole } from "@prisma/client"

interface SearchParams {
  search?: string
  status?: string
  type?: string
  priority?: string
  secretariatId?: string
  from?: string
  to?: string
  overdue?: string
  page?: string
  pageSize?: string
}

async function getProtocols(
  params: SearchParams,
  role: UserRole,
  userSecretariatId: string | null | undefined
) {
  const filters = protocolFiltersValidator.parse({
    ...params,
    page: params.page ? Number(params.page) : 1,
    pageSize: params.pageSize ? Number(params.pageSize) : 20,
  })

  let where: Record<string, any> = {}

  if (filters.search) {
    where.OR = [
      { number: { contains: filters.search, mode: "insensitive" } },
      { title: { contains: filters.search, mode: "insensitive" } },
      { requesterName: { contains: filters.search, mode: "insensitive" } },
    ]
  }
  if (filters.status) where.status = filters.status
  if (filters.type) where.type = filters.type
  if (filters.priority) where.priority = filters.priority
  if (filters.secretariatId) where.currentSecretariatId = filters.secretariatId
  if (filters.from || filters.to) {
    where.createdAt = {}
    if (filters.from) where.createdAt.gte = new Date(filters.from)
    if (filters.to) {
      const to = new Date(filters.to)
      to.setHours(23, 59, 59, 999)
      where.createdAt.lte = to
    }
  }

  if (params.overdue === "true") {
    where.deadlineAt = { lt: new Date() }
    where.status = { notIn: ["CLOSED", "ARCHIVED"] }
  }

  if (isSecretariatScoped(role) && userSecretariatId) {
    const involvement = {
      OR: [
        { originSecretariatId: userSecretariatId },
        { currentSecretariatId: userSecretariatId },
        {
          movements: {
            some: {
              OR: [
                { fromSecretariatId: userSecretariatId },
                { toSecretariatId: userSecretariatId },
              ],
            },
          },
        },
      ],
    }
    if (Object.keys(where).length > 0) {
      where = { AND: [involvement, where] }
    } else {
      where = involvement
    }
  }

  const [total, protocols] = await Promise.all([
    prisma.protocol.count({ where }),
    prisma.protocol.findMany({
      where,
      take: filters.pageSize,
      skip: (filters.page - 1) * filters.pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        number: true,
        title: true,
        type: true,
        status: true,
        priority: true,
        requesterName: true,
        currentSecretariat: { select: { name: true, code: true } },
        currentSector: { select: { name: true } },
        createdBy: { select: { name: true } },
        createdAt: true,
        deadlineAt: true,
        _count: { select: { documents: true, movements: true } },
      },
    }),
  ])

  return { protocols, total, page: filters.page, pageSize: filters.pageSize }
}

async function getSecretariats() {
  return prisma.secretariat.findMany({
    where: { active: true },
    select: { id: true, name: true, code: true },
    orderBy: { name: "asc" },
  })
}

export default async function ProtocolsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await auth()
  const params = await searchParams
  const [{ protocols, total, page, pageSize }, secretariats] = await Promise.all([
    getProtocols(params, session!.user.role, session!.user.secretariatId),
    getSecretariats(),
  ])

  const canCreate = ["ADMIN_SISTEMA", "DEV", "ADMIN", "GESTOR", "PREFEITO", "VICE_PREFEITO", "SECRETARIO", "SERVIDOR_PUBLICO", "PROTOCOLO"].includes(session?.user.role ?? "")
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <Topbar
        title="Protocolos"
        subtitle={`${total} protocolo${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`}
      />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <ProtocolFilters secretariats={secretariats} />
          {canCreate && (
            <Link href="/protocols/novo">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Novo Protocolo
              </Button>
            </Link>
          )}
        </div>

        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-36">Número</TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="w-28">Tipo</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead className="w-24">Prioridade</TableHead>
                <TableHead>Secretaria Atual</TableHead>
                <TableHead className="w-28">Data</TableHead>
                <TableHead className="w-16 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {protocols.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    Nenhum protocolo encontrado com os filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : (
                protocols.map((p) => {
                  const now = new Date()
                  const isOverdue =
                    p.deadlineAt && p.deadlineAt < now &&
                    p.status !== "CLOSED" && p.status !== "ARCHIVED"
                  const isNearDeadline =
                    !isOverdue && p.deadlineAt &&
                    (p.deadlineAt.getTime() - now.getTime()) < 3 * 24 * 60 * 60 * 1000 &&
                    p.status !== "CLOSED" && p.status !== "ARCHIVED"
                  return (
                  <TableRow
                    key={p.id}
                    className={
                      isOverdue
                        ? "bg-destructive/5"
                        : isNearDeadline
                        ? "bg-yellow-50 dark:bg-yellow-950/20"
                        : undefined
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold text-primary">
                          {p.number}
                        </span>
                        {isOverdue && (
                          <span title="Prazo vencido">
                            <AlertTriangle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[280px]">
                        <p className="text-sm font-medium truncate">{p.title}</p>
                        {p.requesterName && (
                          <p className="text-xs text-muted-foreground truncate">
                            {p.requesterName}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {PROTOCOL_TYPE_LABELS[p.type]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={PROTOCOL_STATUS_VARIANTS[p.status] ?? "outline"}
                        className="text-xs"
                      >
                        {PROTOCOL_STATUS_LABELS[p.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={PROTOCOL_PRIORITY_VARIANTS[p.priority] ?? "outline"}
                        className="text-xs"
                      >
                        {PROTOCOL_PRIORITY_LABELS[p.priority]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-xs font-medium">{p.currentSecretariat.code}</p>
                        {p.currentSector && (
                          <p className="text-xs text-muted-foreground">{p.currentSector.name}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(p.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/protocols/${p.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Página {page} de {totalPages} · {total} registros
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`?${new URLSearchParams({ ...params, page: String(page - 1) })}`}
                >
                  <Button variant="outline" size="sm">Anterior</Button>
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`?${new URLSearchParams({ ...params, page: String(page + 1) })}`}
                >
                  <Button variant="outline" size="sm">Próxima</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
