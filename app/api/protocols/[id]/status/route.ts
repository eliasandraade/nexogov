import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { updateProtocolStatusValidator } from "@/validators/protocol.validator"
import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit/log"
import { canForwardProtocol } from "@/lib/permissions"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  if (!canForwardProtocol(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = updateProtocolStatusValidator.safeParse({ ...body, protocolId: id })

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    )
  }

  try {
    const protocol = await prisma.protocol.update({
      where: { id },
      data: {
        status: parsed.data.status as any,
        closedAt: ["CLOSED", "ARCHIVED"].includes(parsed.data.status) ? new Date() : undefined,
      },
    })

    await prisma.movement.create({
      data: {
        protocolId: id,
        type: "STATUS_UPDATE",
        description: parsed.data.notes ?? `Status alterado para ${parsed.data.status}.`,
        fromSecretariatId: protocol.currentSecretariatId,
        fromSectorId: protocol.currentSectorId,
        performedById: session.user.id,
      },
    })

    await logAudit({
      action: "PROTOCOL_STATUS_CHANGED",
      userId: session.user.id,
      entityType: "Protocol",
      entityId: id,
      metadata: { status: parsed.data.status },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[PATCH /api/protocols/[id]/status]", error)
    return NextResponse.json({ error: "Erro ao atualizar status" }, { status: 500 })
  }
}
