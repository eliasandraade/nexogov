import { Topbar } from "@/components/layout/Topbar"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils/format"
import {
  PROTOCOL_STATUS_LABELS,
  PROTOCOL_STATUS_VARIANTS,
  PROTOCOL_PRIORITY_LABELS,
  PROTOCOL_PRIORITY_VARIANTS,
  PROTOCOL_TYPE_LABELS,
} from "@/lib/utils/labels"
import { isSecretariatScoped } from "@/lib/permissions"
import { AlertTriangle, Clock, FileText, ArrowRight } from "lucide-react"
import Link from "next/link"

async function getQueue(secretariatId: string | null, isScoped: boolean) {
  const where: any = {
    status: { notIn: ["CLOSED", "ARCHIVED", "REJECTED"] },
  }

  if (isScoped && secretariatId) {
    where.currentSecretariatId = secretariatId
  }

  const protocols = await prisma.protocol.findMany({
    where,
    orderBy: [
      { priority: "desc" },
      { deadlineAt: "asc" },
      { createdAt: "asc" },
    ],
    select: {
      id: true,
      number: true,
      title: true,
      status: true,
      priority: true,
      type: true,
      deadlineAt: true,
      createdAt: true,
      currentSecretariat: { select: { name: true, code: true } },
      currentSector: { select: { name: true } },
      createdBy: { select: { name: true } },
      _count: { select: { movements: true } },
    },
  })

  return protocols
}

export default async function QueuePage() {
  const session = await auth()
  if (!session) return null

  const isScoped = isSecretariatScoped(session.user.role)
  const secretariatId = session.user.secretariatId ?? null

  const protocols = await getQueue(secretariatId, isScoped)
  const now = new Date()
  const overdue = protocols.filter(p => p.deadlineAt && p.deadlineAt < now)
  const onTime = protocols.filter(p => !p.deadlineAt || p.deadlineAt >= now)

  const subtitle = isScoped
    ? `${protocols.length} protocolo${protocols.length !== 1 ? "s" : ""} na fila da sua secretaria`
    : `${protocols.length} protocolo${protocols.length !== 1 ? "s" : ""} ativos no sistema`

  function ProtocolRow({ p }: { p: typeof protocols[0] }) {
    const isOverdue = p.deadlineAt && p.deadlineAt < now
    const daysSince = Math.floor((now.getTime() - p.createdAt.getTime()) / 86400000)

    return (
      <Link href={`/protocols/${p.id}`}>
        <div className="flex items-start gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors border-b border-border last:border-0 cursor-pointer">
          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-primary">{p.number}</span>
              <Badge variant={(PROTOCOL_STATUS_VARIANTS[p.status] ?? "outline") as any} className="text-[10px]">
                {PROTOCOL_STATUS_LABELS[p.status]}
              </Badge>
              <Badge variant={(PROTOCOL_PRIORITY_VARIANTS[p.priority] ?? "outline") as any} className="text-[10px]">
                {PROTOCOL_PRIORITY_LABELS[p.priority]}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="text-[10px] flex items-center gap-1">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  Atrasado
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium truncate mt-0.5">{p.title}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span>{PROTOCOL_TYPE_LABELS[p.type]}</span>
              {!isScoped && (
                <>
                  <ArrowRight className="h-3 w-3" />
                  <span>{p.currentSecretariat.code}{p.currentSector ? ` · ${p.currentSector.name}` : ""}</span>
                </>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {daysSince === 0 ? "Hoje" : `${daysSince}d no sistema`}
              </span>
              {p.deadlineAt && (
                <span className={isOverdue ? "text-destructive font-medium" : ""}>
                  Prazo: {formatDate(p.deadlineAt)}
                </span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-[10px] text-muted-foreground">{p._count.movements} movimentações</p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div>
      <Topbar title="Minha Fila" subtitle={subtitle} />
      <div className="p-6 space-y-6">

        {protocols.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum protocolo ativo na fila.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {overdue.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <h2 className="text-sm font-semibold text-destructive">Atrasados ({overdue.length})</h2>
                </div>
                <Card className="overflow-hidden border-destructive/20">
                  {overdue.map(p => <ProtocolRow key={p.id} p={p} />)}
                </Card>
              </div>
            )}

            {onTime.length > 0 && (
              <div>
                {overdue.length > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold text-foreground">Em dia ({onTime.length})</h2>
                  </div>
                )}
                <Card className="overflow-hidden">
                  {onTime.map(p => <ProtocolRow key={p.id} p={p} />)}
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
