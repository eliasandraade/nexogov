import { auth } from "@/lib/auth/auth"
import { Topbar } from "@/components/layout/Topbar"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils/format"
import { FileText, Clock, CheckCircle, AlertCircle, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PROTOCOL_STATUS_LABELS, PROTOCOL_STATUS_VARIANTS } from "@/lib/utils/labels"

async function getDashboardData() {
  const [
    totalProtocols,
    byStatus,
    recentProtocols,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.protocol.count(),
    prisma.protocol.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.protocol.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        number: true,
        title: true,
        status: true,
        priority: true,
        currentSecretariat: { select: { name: true, code: true } },
        createdAt: true,
      },
    }),
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        user: { select: { name: true } },
        createdAt: true,
      },
    }),
  ])

  const openCount = byStatus.find((s) => s.status === "OPEN")?._count.status ?? 0
  const inProgressCount = byStatus.find((s) => s.status === "IN_PROGRESS")?._count.status ?? 0
  const closedCount = byStatus.find((s) => s.status === "CLOSED")?._count.status ?? 0
  const pendingCount = byStatus.find((s) => s.status === "PENDING")?._count.status ?? 0

  return { totalProtocols, openCount, inProgressCount, closedCount, pendingCount, recentProtocols, recentAuditLogs }
}

export default async function DashboardPage() {
  const session = await auth()
  const data = await getDashboardData()

  return (
    <div>
      <Topbar
        title="Dashboard"
        subtitle={`Bem-vindo, ${session?.user.name}`}
      />
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total de Protocolos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{data.totalProtocols}</span>
                <FileText className="h-8 w-8 text-muted-foreground/30" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Em Aberto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-blue-600">{data.openCount}</span>
                <TrendingUp className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Em Tramitação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-yellow-600">{data.inProgressCount}</span>
                <Clock className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Finalizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-green-600">{data.closedCount}</span>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Protocols */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Protocolos Recentes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {data.recentProtocols.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4">Nenhum protocolo cadastrado.</p>
                ) : (
                  data.recentProtocols.map((p) => (
                    <div key={p.id} className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-mono font-medium text-primary">
                            {p.number}
                          </span>
                          <Badge
                            variant={PROTOCOL_STATUS_VARIANTS[p.status as keyof typeof PROTOCOL_STATUS_VARIANTS] ?? "outline"}
                            className="text-[10px] py-0"
                          >
                            {PROTOCOL_STATUS_LABELS[p.status as keyof typeof PROTOCOL_STATUS_LABELS]}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {p.currentSecretariat.name} · {formatDate(p.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Audit */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {data.recentAuditLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4">Nenhuma atividade registrada.</p>
                ) : (
                  data.recentAuditLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{log.action}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {log.user?.name ?? "Sistema"} · {formatDate(log.createdAt, true)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
