import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth/auth"
import { Topbar } from "@/components/layout/Topbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatDate, formatFileSize } from "@/lib/utils/format"
import {
  PROTOCOL_STATUS_LABELS,
  PROTOCOL_STATUS_VARIANTS,
  PROTOCOL_PRIORITY_LABELS,
  PROTOCOL_TYPE_LABELS,
  MOVEMENT_TYPE_LABELS,
} from "@/lib/utils/labels"
import { ProtocolTimeline } from "@/components/timeline/ProtocolTimeline"
import { ForwardProtocolButton } from "@/components/protocols/ForwardProtocolButton"
import { DocumentUploadForm } from "@/components/documents/DocumentUploadForm"
import { ProtocolStatusButton } from "@/components/protocols/ProtocolStatusButton"
import { MetricsService } from "@/services/metrics.service"
import { FileText, User, Calendar, MapPin, Clock, Download, Timer, Printer } from "lucide-react"
import Link from "next/link"

async function getProtocol(id: string) {
  return prisma.protocol.findUnique({
    where: { id },
    include: {
      originSecretariat: { select: { name: true, code: true } },
      originOrgan: { select: { name: true } },
      originSector: { select: { name: true } },
      currentSecretariat: { select: { name: true, code: true } },
      currentOrgan: { select: { name: true } },
      currentSector: { select: { name: true } },
      createdBy: { select: { name: true } },
      movements: {
        orderBy: { createdAt: "asc" },
        include: {
          fromSecretariat: { select: { name: true, code: true } },
          fromSector: { select: { name: true } },
          toSecretariat: { select: { name: true, code: true } },
          toSector: { select: { name: true } },
          performedBy: { select: { name: true } },
        },
      },
      documents: {
        orderBy: { createdAt: "desc" },
        include: {
          uploadedBy: { select: { name: true } },
        },
      },
    },
  })
}

export default async function ProtocolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  const [protocol, elapsed] = await Promise.all([
    getProtocol(id),
    MetricsService.getProtocolElapsedDays(id),
  ])

  if (!protocol) notFound()

  const canForward = ["ADMIN_SISTEMA", "DEV", "ADMIN", "GESTOR", "PREFEITO", "VICE_PREFEITO", "SECRETARIO", "SERVIDOR_PUBLICO", "PROTOCOLO"].includes(
    session?.user.role ?? ""
  )

  return (
    <div>
      <Topbar
        title={`Protocolo ${protocol.number}`}
        subtitle={protocol.title}
      />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-lg font-bold text-primary">
                {protocol.number}
              </span>
              <Badge variant={PROTOCOL_STATUS_VARIANTS[protocol.status] ?? "outline"}>
                {PROTOCOL_STATUS_LABELS[protocol.status]}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {PROTOCOL_PRIORITY_LABELS[protocol.priority]}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {PROTOCOL_TYPE_LABELS[protocol.type]}
              </Badge>
            </div>
            <h2 className="text-xl font-semibold">{protocol.title}</h2>
          </div>

          <div className="flex gap-2 flex-wrap">
            {canForward && protocol.status !== "CLOSED" && protocol.status !== "ARCHIVED" && (
              <>
                <ForwardProtocolButton protocolId={protocol.id} />
                <DocumentUploadForm protocolId={protocol.id} />
                <ProtocolStatusButton protocolId={protocol.id} currentStatus={protocol.status} />
              </>
            )}
            <Link href={`/protocols/${protocol.id}/print`} target="_blank">
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {protocol.description}
                </p>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Histórico de Movimentações ({protocol.movements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProtocolTimeline movements={protocol.movements} />
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Documentos Anexados ({protocol.documents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {protocol.documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum documento anexado.</p>
                ) : (
                  <div className="space-y-2">
                    {protocol.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 p-3 rounded-md border bg-muted/30"
                      >
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.originalName}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(doc.sizeBytes)} · {doc.uploadedBy.name} · {formatDate(doc.createdAt)}
                          </p>
                          {doc.description && (
                            <p className="text-xs text-muted-foreground italic mt-0.5">{doc.description}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-[10px] flex-shrink-0">
                          {doc.visibility === "INTERNAL" ? "Interno" : "Restrito"}
                        </Badge>
                        <Link href={`/api/documents/${doc.id}/download`} target="_blank">
                          <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            {/* Current location */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Localização Atual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    Secretaria
                  </p>
                  <p className="font-medium">{protocol.currentSecretariat.name}</p>
                </div>
                {protocol.currentOrgan && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                      Órgão
                    </p>
                    <p>{protocol.currentOrgan.name}</p>
                  </div>
                )}
                {protocol.currentSector && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                      Setor
                    </p>
                    <p>{protocol.currentSector.name}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Requesters */}
            {(() => {
              const requesters = Array.isArray(protocol.requesters) && protocol.requesters.length > 0
                ? protocol.requesters as Array<{name: string; document?: string; company?: string}>
                : protocol.requesterName
                  ? [{ name: protocol.requesterName, document: protocol.requesterDocument ?? undefined }]
                  : []
              if (requesters.length === 0) return null
              return (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Interessado{requesters.length > 1 ? "s" : ""}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-3">
                    {requesters.map((r, i) => (
                      <div key={i} className={i > 0 ? "pt-3 border-t border-border" : ""}>
                        <p className="font-medium">{r.name}</p>
                        {r.document && <p className="text-xs text-muted-foreground">{r.document}</p>}
                        {r.company && <p className="text-xs text-muted-foreground italic">{r.company}</p>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )
            })()}

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Informações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    Origem
                  </p>
                  <p>{protocol.originSecretariat.name}</p>
                  {protocol.originSector && (
                    <p className="text-xs text-muted-foreground">
                      {protocol.originSector.name}
                    </p>
                  )}
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    Criado por
                  </p>
                  <p>{protocol.createdBy.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(protocol.createdAt, true)}
                  </p>
                </div>
                {protocol.deadlineAt && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Prazo
                      </p>
                      <p className={protocol.deadlineAt < new Date() ? "text-destructive font-medium" : ""}>
                        {formatDate(protocol.deadlineAt)}
                      </p>
                    </div>
                  </>
                )}
                {elapsed && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        Tempo decorrido
                      </p>
                      <p className="font-medium">
                        {elapsed.elapsedDays === 0
                          ? "Menos de 1 dia"
                          : `${elapsed.elapsedDays} dia${elapsed.elapsedDays !== 1 ? "s" : ""}`}
                      </p>
                      {elapsed.isClosed && (
                        <p className="text-xs text-muted-foreground">até encerramento</p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
