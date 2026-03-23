import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { canCreateProtocol } from "@/lib/permissions"
import { ProtocolService } from "@/services/protocol.service"
import { logAudit } from "@/lib/audit/log"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || !canCreateProtocol(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  const { id } = await params

  const source = await prisma.protocol.findUnique({
    where: { id },
    select: {
      title: true,
      description: true,
      type: true,
      priority: true,
      requesters: true,
      requesterName: true,
      requesterDocument: true,
      internalNotes: true,
      deadlineAt: true,
      originSecretariatId: true,
      originOrganId: true,
      originSectorId: true,
    },
  })

  if (!source) return NextResponse.json({ error: "Protocolo não encontrado" }, { status: 404 })

  const password = Math.random().toString(36).slice(2, 10)

  const newProtocol = await ProtocolService.create(
    {
      title: `${source.title} (cópia)`,
      description: source.description,
      type: source.type as any,
      priority: source.priority as any,
      requesters: (source.requesters as any[]) ?? [],
      requesterName: source.requesterName ?? undefined,
      requesterDocument: source.requesterDocument ?? undefined,
      internalNotes: source.internalNotes ?? undefined,
      deadlineAt: source.deadlineAt?.toISOString() ?? undefined,
      originSecretariatId: source.originSecretariatId,
      originOrganId: source.originOrganId ?? undefined,
      originSectorId: source.originSectorId ?? undefined,
      currentSecretariatId: source.originSecretariatId,
      currentOrganId: source.originOrganId ?? undefined,
      currentSectorId: source.originSectorId ?? undefined,
      password,
    },
    session.user.id
  )

  await logAudit({
    action: "PROTOCOL_CLONED",
    userId: session.user.id,
    secretariatId: session.user.secretariatId ?? undefined,
    entityType: "Protocol",
    entityId: newProtocol.id,
    metadata: { sourceId: id, sourceNumber: source.title },
  })

  return NextResponse.json({ id: newProtocol.id, number: newProtocol.number })
}
