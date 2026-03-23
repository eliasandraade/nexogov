import { Topbar } from "@/components/layout/Topbar"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { canViewDashboard } from "@/lib/permissions"
import { MetricsService } from "@/services/metrics.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Clock, TrendingUp, CheckCircle, FileText } from "lucide-react"

export default async function MetricsPage() {
  const session = await auth()
  if (!session || !canViewDashboard(session.user.role)) redirect("/dashboard")

  const metrics = await MetricsService.getSecretariatMetrics()

  const totalCurrent = metrics.reduce((a, m) => a + m.current.total, 0)
  const totalOriginated = metrics.reduce((a, m) => a + m.originated.total, 0)
  const totalClosed = metrics.reduce((a, m) => a + m.originated.closed, 0)
  const totalPending = metrics.reduce((a, m) => a + m.current.pending, 0)

  return (
    <div>
      <Topbar title="Métricas" subtitle="Desempenho por secretaria e tempo de tramitação" />
      <div className="p-6 space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Em tramitação</span>
                <TrendingUp className="h-4 w-4 text-blue-300" />
              </div>
              <p className="text-3xl font-bold text-blue-600">{totalCurrent}</p>
              <p className="text-xs text-muted-foreground mt-1">protocolos ativos no sistema</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total criados</span>
                <FileText className="h-4 w-4 text-muted-foreground/40" />
              </div>
              <p className="text-3xl font-bold">{totalOriginated}</p>
              <p className="text-xs text-muted-foreground mt-1">protocolos originados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Finalizados</span>
                <CheckCircle className="h-4 w-4 text-green-300" />
              </div>
              <p className="text-3xl font-bold text-green-600">{totalClosed}</p>
              <p className="text-xs text-muted-foreground mt-1">protocolos encerrados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pendentes</span>
                <Clock className="h-4 w-4 text-yellow-300" />
              </div>
              <p className="text-3xl font-bold text-yellow-600">{totalPending}</p>
              <p className="text-xs text-muted-foreground mt-1">aguardando ação</p>
            </CardContent>
          </Card>
        </div>

        {/* Metrics table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Métricas por Secretaria</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-b-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Secretaria</TableHead>
                    <TableHead className="text-center w-24">Atualmente</TableHead>
                    <TableHead className="text-center w-20">Abertos</TableHead>
                    <TableHead className="text-center w-24">Em Trâmite</TableHead>
                    <TableHead className="text-center w-24">Pendentes</TableHead>
                    <TableHead className="text-center w-24">Criados</TableHead>
                    <TableHead className="text-center w-28">Finalizados</TableHead>
                    <TableHead className="text-center w-32">Tempo médio</TableHead>
                    <TableHead className="text-center w-24">Atraso</TableHead>
                    <TableHead className="text-center w-28">Encaminhados</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground text-sm">
                        Nenhuma secretaria ativa com protocolos.
                      </TableCell>
                    </TableRow>
                  ) : (
                    metrics.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div>
                            <span className="font-mono text-xs font-semibold text-primary">{m.code}</span>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{m.name}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold text-sm">{m.current.total}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          {m.current.open > 0 ? (
                            <Badge variant="default" className="text-xs">{m.current.open}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {m.current.inProgress > 0 ? (
                            <Badge variant="warning" className="text-xs">{m.current.inProgress}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {m.current.pending > 0 ? (
                            <Badge variant="secondary" className="text-xs">{m.current.pending}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {m.originated.total}
                        </TableCell>
                        <TableCell className="text-center">
                          {m.originated.closed > 0 ? (
                            <Badge variant="success" className="text-xs">{m.originated.closed}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {m.originated.avgDaysToClose !== null ? (
                            <div className="flex items-center justify-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs font-medium">{m.originated.avgDaysToClose}d</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {m.sla.overdue > 0 ? (
                            <Badge variant="destructive" className="text-xs">{m.sla.overdue}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {m.sla.forwarded > 0 ? m.sla.forwarded : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          <strong>Atualmente</strong>: protocolos cuja localização atual é esta secretaria.{" "}
          <strong>Criados</strong>: protocolos que se originaram nesta secretaria.{" "}
          <strong>Tempo médio</strong>: média de dias entre abertura e encerramento dos protocolos originados.
        </p>
      </div>
    </div>
  )
}
