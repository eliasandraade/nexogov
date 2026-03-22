import { Topbar } from "@/components/layout/Topbar"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/lib/utils/format"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { canViewAuditLogs } from "@/lib/permissions"

async function getAuditData() {
  const [auditLogs, documentAccessLogs] = await Promise.all([
    prisma.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        metadata: true,
        ip: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        secretariat: { select: { code: true } },
      },
    }),
    prisma.documentAccessLog.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        accessType: true,
        accessOrigin: true,
        success: true,
        failReason: true,
        ip: true,
        createdAt: true,
        document: { select: { originalName: true } },
        protocol: { select: { number: true } },
        user: { select: { name: true } },
      },
    }),
  ])
  return { auditLogs, documentAccessLogs }
}

const ACTION_VARIANTS: Record<string, "default" | "destructive" | "secondary" | "outline" | "success" | "warning"> = {
  LOGIN: "success",
  LOGOUT: "secondary",
  PROTOCOL_CREATED: "default",
  PROTOCOL_FORWARDED: "warning",
  DOCUMENT_VIEWED: "outline",
  DOCUMENT_DOWNLOADED: "outline",
  DOCUMENT_ACCESS_DENIED: "destructive",
  ERROR: "destructive",
}

export default async function AuditPage() {
  const session = await auth()
  if (!session || !canViewAuditLogs(session.user.role)) redirect("/dashboard")

  const { auditLogs, documentAccessLogs } = await getAuditData()
  const invalidAttempts = documentAccessLogs.filter((l) => !l.success)

  return (
    <div>
      <Topbar title="Auditoria" subtitle="Registros de atividade e acesso do sistema" />
      <div className="p-6">
        <Tabs defaultValue="system">
          <TabsList className="mb-4">
            <TabsTrigger value="system">
              Atividade do Sistema ({auditLogs.length})
            </TabsTrigger>
            <TabsTrigger value="documents">
              Acesso a Documentos ({documentAccessLogs.length})
            </TabsTrigger>
            <TabsTrigger value="invalid" className={invalidAttempts.length > 0 ? "text-destructive" : ""}>
              Tentativas Inválidas ({invalidAttempts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="system">
            <div className="rounded-lg border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Ação</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Entidade</TableHead>
                    <TableHead>Secretaria</TableHead>
                    <TableHead className="w-28">IP</TableHead>
                    <TableHead className="w-36">Data/Hora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge
                          variant={ACTION_VARIANTS[log.action] ?? "outline"}
                          className="text-xs font-mono"
                        >
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-xs font-medium">{log.user?.name ?? "Sistema"}</p>
                          {log.user?.email && (
                            <p className="text-xs text-muted-foreground">{log.user.email}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.entityType && (
                          <div>
                            <p className="text-xs text-muted-foreground">{log.entityType}</p>
                            <p className="text-xs font-mono truncate max-w-[120px]">{log.entityId}</p>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono">{log.secretariat?.code ?? "—"}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono text-muted-foreground">{log.ip}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(log.createdAt, true)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <div className="rounded-lg border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Protocolo</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-36">Data/Hora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentAccessLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <span className="font-mono text-xs font-semibold text-primary">
                          {log.protocol.number}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs truncate max-w-[160px] block">
                          {log.document.originalName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{log.accessType}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{log.accessOrigin}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">{log.user?.name ?? "Externo"}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.success ? "success" : "destructive"} className="text-xs">
                          {log.success ? "OK" : "Negado"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(log.createdAt, true)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="invalid">
            <div className="rounded-lg border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Protocolo</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead className="w-36">Data/Hora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invalidAttempts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                        Nenhuma tentativa inválida registrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    invalidAttempts.map((log) => (
                      <TableRow key={log.id} className="bg-destructive/5">
                        <TableCell>
                          <span className="font-mono text-xs font-semibold text-primary">
                            {log.protocol.number}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-destructive">{log.failReason ?? "—"}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">{log.accessOrigin}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-mono">{log.ip}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(log.createdAt, true)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
