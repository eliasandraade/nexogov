import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth/auth"
import { formatDate } from "@/lib/utils/format"
import {
  PROTOCOL_STATUS_LABELS,
  PROTOCOL_PRIORITY_LABELS,
  PROTOCOL_TYPE_LABELS,
  MOVEMENT_TYPE_LABELS,
  DOCUMENT_CATEGORY_LABELS,
} from "@/lib/utils/labels"
import { PrintActions } from "@/components/protocols/PrintActions"

async function getProtocol(id: string) {
  return prisma.protocol.findUnique({
    where: { id },
    include: {
      originSecretariat: { select: { name: true, code: true } },
      originSector: { select: { name: true } },
      currentSecretariat: { select: { name: true, code: true } },
      currentSector: { select: { name: true } },
      createdBy: { select: { name: true } },
      movements: {
        orderBy: { createdAt: "asc" },
        include: {
          fromSecretariat: { select: { name: true, code: true } },
          toSecretariat: { select: { name: true, code: true } },
          performedBy: { select: { name: true } },
        },
      },
      documents: {
        orderBy: { createdAt: "desc" },
        include: { uploadedBy: { select: { name: true } } },
      },
    },
  })
}

export default async function ProtocolPrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await auth() // ensure authenticated
  const protocol = await getProtocol(id)
  if (!protocol) notFound()

  const requesters =
    Array.isArray(protocol.requesters) && protocol.requesters.length > 0
      ? (protocol.requesters as Array<{ name: string; document?: string; company?: string }>)
      : protocol.requesterName
        ? [{ name: protocol.requesterName, document: protocol.requesterDocument ?? undefined }]
        : []

  return (
    <div className="bg-white text-black min-h-screen print:p-0">
      <PrintActions />

      <div className="max-w-[800px] mx-auto p-8 print:p-6">
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-lg font-bold uppercase tracking-wide">
            Protocolo Administrativo
          </h1>
          <p className="text-2xl font-mono font-bold mt-1">{protocol.number}</p>
          <p className="text-sm text-gray-600 mt-1">
            Emitido em {formatDate(protocol.createdAt, true)}
          </p>
        </div>

        {/* Protocol info grid */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <p className="font-semibold text-gray-500 text-xs uppercase">Título</p>
            <p className="font-medium">{protocol.title}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-500 text-xs uppercase">Status</p>
            <p>{PROTOCOL_STATUS_LABELS[protocol.status]}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-500 text-xs uppercase">Tipo</p>
            <p>{PROTOCOL_TYPE_LABELS[protocol.type]}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-500 text-xs uppercase">Prioridade</p>
            <p>{PROTOCOL_PRIORITY_LABELS[protocol.priority]}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-500 text-xs uppercase">Secretaria de Origem</p>
            <p>{protocol.originSecretariat.code} — {protocol.originSecretariat.name}</p>
            {protocol.originSector && (
              <p className="text-gray-600">{protocol.originSector.name}</p>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-500 text-xs uppercase">Localização Atual</p>
            <p>{protocol.currentSecretariat.code} — {protocol.currentSecretariat.name}</p>
            {protocol.currentSector && (
              <p className="text-gray-600">{protocol.currentSector.name}</p>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-500 text-xs uppercase">Criado por</p>
            <p>{protocol.createdBy.name}</p>
          </div>
          {protocol.deadlineAt && (
            <div>
              <p className="font-semibold text-gray-500 text-xs uppercase">Prazo</p>
              <p>{formatDate(protocol.deadlineAt)}</p>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase border-b border-gray-300 pb-1 mb-2">
            Descrição
          </h2>
          <p className="text-sm whitespace-pre-wrap">{protocol.description}</p>
        </div>

        {/* Requesters */}
        {requesters.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase border-b border-gray-300 pb-1 mb-2">
              Interessado{requesters.length > 1 ? "s" : ""}
            </h2>
            <div className="space-y-1 text-sm">
              {requesters.map((r, i) => (
                <p key={i}>
                  <span className="font-medium">{r.name}</span>
                  {r.document && <span className="text-gray-600"> — {r.document}</span>}
                  {r.company && <span className="text-gray-600 italic"> ({r.company})</span>}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Movements */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase border-b border-gray-300 pb-1 mb-2">
            Histórico de Movimentações ({protocol.movements.length})
          </h2>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-1.5 pr-2 font-semibold w-12">#</th>
                <th className="text-left py-1.5 pr-2 font-semibold">Data</th>
                <th className="text-left py-1.5 pr-2 font-semibold">Tipo</th>
                <th className="text-left py-1.5 pr-2 font-semibold">Descrição</th>
                <th className="text-left py-1.5 font-semibold">Responsável</th>
              </tr>
            </thead>
            <tbody>
              {protocol.movements.map((m, i) => (
                <tr key={m.id} className="border-b border-gray-100">
                  <td className="py-1.5 pr-2 text-gray-500">{i + 1}</td>
                  <td className="py-1.5 pr-2 whitespace-nowrap">
                    {formatDate(m.createdAt, true)}
                  </td>
                  <td className="py-1.5 pr-2 whitespace-nowrap">
                    {MOVEMENT_TYPE_LABELS[m.type] ?? m.type}
                  </td>
                  <td className="py-1.5 pr-2">{m.description}</td>
                  <td className="py-1.5">{m.performedBy.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Documents */}
        {protocol.documents.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase border-b border-gray-300 pb-1 mb-2">
              Documentos Anexados ({protocol.documents.length})
            </h2>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-1.5 pr-2 font-semibold">Arquivo</th>
                  <th className="text-left py-1.5 pr-2 font-semibold">Categoria</th>
                  <th className="text-left py-1.5 pr-2 font-semibold">Visibilidade</th>
                  <th className="text-left py-1.5 pr-2 font-semibold">Enviado por</th>
                  <th className="text-left py-1.5 font-semibold">Data</th>
                </tr>
              </thead>
              <tbody>
                {protocol.documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-100">
                    <td className="py-1.5 pr-2">
                      <span className="font-medium">{doc.originalName}</span>
                      {doc.fileHash && (
                        <span className="block text-gray-400 font-mono text-[10px]">
                          {doc.fileHash.slice(0, 16)}…
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 pr-2">
                      {doc.category ? (DOCUMENT_CATEGORY_LABELS[doc.category] ?? doc.category) : "—"}
                    </td>
                    <td className="py-1.5 pr-2">
                      {doc.visibility === "INTERNAL" ? "Interno" : "Restrito"}
                    </td>
                    <td className="py-1.5 pr-2">{doc.uploadedBy.name}</td>
                    <td className="py-1.5">{formatDate(doc.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="border-t-2 border-black pt-3 text-xs text-gray-500 text-center mt-8">
          <p>Documento gerado pelo sistema NexoGov em {formatDate(new Date(), true)}</p>
          <p className="mt-0.5">Este documento é apenas para fins de referência interna.</p>
        </div>
      </div>
    </div>
  )
}
