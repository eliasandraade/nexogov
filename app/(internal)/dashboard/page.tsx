import { auth } from "@/lib/auth/auth"
import { Topbar } from "@/components/layout/Topbar"
import { DashboardService } from "@/services/dashboard.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatRelativeTime } from "@/lib/utils/format"
import {
  PROTOCOL_STATUS_LABELS,
  PROTOCOL_STATUS_VARIANTS,
} from "@/lib/utils/labels"
import {
  FileText, Clock, CheckCircle, AlertTriangle, TrendingUp,
  ArrowRight, Shield, Activity,
} from "lucide-react"
import Link from "next/link"
import { StatusChart } from "@/components/dashboard/StatusChart"
import { TemporalChart } from "@/components/dashboard/TemporalChart"
import { FlowMatrix } from "@/components/dashboard/FlowMatrix"

const STATUS_COLORS: Record<string, string> = {
  OPEN: "#3b82f6",
  IN_PROGRESS: "#8b5cf6",
  PENDING: "#eab308",
  DEFERRED: "#f97316",
  CLOSED: "#22c55e",
  ARCHIVED: "#6b7280",
}

export default async function DashboardPage() {
  const session = await auth()
  const data = await DashboardService.getMetrics()

  const chartData = [
    { label: "Abertos", value: data.openCount, color: STATUS_COLORS.OPEN },
    { label: "Andamento", value: data.inProgressCount, color: STATUS_COLORS.IN_PROGRESS },
    { label: "Pendentes", value: data.pendingCount, color: STATUS_COLORS.PENDING },
    { label: "Diferidos", value: (data as any).deferredCount ?? 0, color: STATUS_COLORS.DEFERRED },
    { label: "Encerrados", value: data.closedCount, color: STATUS_COLORS.CLOSED },
    { label: "Arquivados", value: data.archivedCount, color: STATUS_COLORS.ARCHIVED },
  ].filter((d) => d.value > 0)

  return (
    <div>
      <Topbar title="Dashboard" subtitle={`Bem-vindo, ${session?.user.name}`} />
      <div className="p-6 space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total</span>
                <FileText className="h-4 w-4 text-muted-foreground/40" />
              </div>
              <p className="text-3xl font-bold">{data.totalProtocols}</p>
              <p className="text-xs text-muted-foreground mt-1">
                +{data.recentProtocols} nos últimos 30 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Em Tramitação</span>
                <TrendingUp className="h-4 w-4 text-blue-300" />
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {data.openCount + data.inProgressCount}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {data.openCount} abertos · {data.inProgressCount} em andamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pendentes</span>
                <Clock className="h-4 w-4 text-yellow-300" />
              </div>
              <p className="text-3xl font-bold text-yellow-600">{data.pendingCount}</p>
              {data.overdueProtocols > 0 && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {data.overdueProtocols} com prazo vencido
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Encerrados</span>
                <CheckCircle className="h-4 w-4 text-green-300" />
              </div>
              <p className="text-3xl font-bold text-green-600">{data.closedCount}</p>
              {data.avgTramitationDays !== null && (
                <p className="text-xs text-muted-foreground mt-1">
                  Média: {data.avgTramitationDays} dias
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status chart */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Protocolos por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusChart data={chartData} />
            </CardContent>
          </Card>

          {/* By secretariat */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Por Secretaria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.bySecretariat.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum dado.</p>
              ) : (
                data.bySecretariat.map((item, i) => {
                  if (!item.secretariat) return null
                  const pct = data.totalProtocols > 0
                    ? Math.round((item.count / data.totalProtocols) * 100)
                    : 0
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium truncate max-w-[160px]" title={item.secretariat.name}>
                          {item.secretariat.code}
                        </span>
                        <span className="text-muted-foreground">{item.count}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          {/* Top flows */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Fluxos Inter-Secretaria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.topFlows.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum encaminhamento registrado.</p>
              ) : (
                data.topFlows.map((flow, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs py-1.5 border-b border-border last:border-0">
                    <span className="font-medium text-primary w-16 flex-shrink-0">{flow.from?.code ?? "—"}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium flex-1">{flow.to?.code ?? "—"}</span>
                    <span className="text-muted-foreground font-mono">{flow.count}x</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Temporal evolution + Flow matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Evolução Mensal (12 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <TemporalChart data={data.temporalData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Matriz de Fluxos Inter-Secretaria</CardTitle>
            </CardHeader>
            <CardContent>
              <FlowMatrix
                secretariats={data.flowSecretariats}
                flows={data.flowMatrixData}
              />
            </CardContent>
          </Card>
        </div>

        {/* Security + recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tentativas inválidas (7d)</span>
                <span className={`font-semibold ${data.documentAccessAttempts > 0 ? "text-destructive" : "text-green-600"}`}>
                  {data.documentAccessAttempts}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Protocolos com prazo vencido</span>
                <span className={`font-semibold ${data.overdueProtocols > 0 ? "text-destructive" : "text-green-600"}`}>
                  {data.overdueProtocols}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Arquivados</span>
                <span className="font-semibold text-muted-foreground">{data.archivedCount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent audit log */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Atividade Recente
                </CardTitle>
                <Link href="/audit" className="text-xs text-primary hover:underline">
                  Ver tudo
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {data.recentAuditLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4">Nenhuma atividade registrada.</p>
                ) : (
                  data.recentAuditLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 px-6 py-3 hover:bg-muted/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{log.action.replace(/_/g, " ")}</span>
                          {log.entityType && (
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {log.entityType}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {log.user?.name ?? "Sistema"}
                          {log.secretariat && ` · ${log.secretariat.code}`}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatRelativeTime(log.createdAt)}
                      </span>
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
