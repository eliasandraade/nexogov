import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { canForwardProtocol } from "@/lib/permissions"
import { logAudit } from "@/lib/audit/log"
import { z } from "zod"

const addMovementValidator = z.object({
  type: z.enum(["DISPATCH", "ADMINISTRATIVE_OPINION", "RECEIPT"]),
  description: z.string().min(5, "Descreva a movimentação").max(2000),
  notes: z.string().max(2000).optional(),
})

export async function POST(
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
  const parsed = addMovementValidator.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    )
  }

  try {
    const protocol = await prisma.protocol.findUnique({
      where: { id },
      select: { currentSecretariatId: true, currentSectorId: true, status: true },
    })

    if (!protocol) {
      return NextResponse.json({ error: "Protocolo não encontrado" }, { status: 404 })
    }
    if (protocol.status === "CLOSED" || protocol.status === "ARCHIVED") {
      return NextResponse.json({ error: "Protocolo encerrado ou arquivado" }, { status: 400 })
    }

    await prisma.movement.create({
      data: {
        protocolId: id,
        type: parsed.data.type,
        description: parsed.data.description,
        notes: parsed.data.notes || null,
        fromSecretariatId: protocol.currentSecretariatId,
        fromSectorId: protocol.currentSectorId,
        performedById: session.user.id,
      },
    })

    await logAudit({
      action: "PROTOCOL_FORWARDED",
      userId: session.user.id,
      entityType: "Protocol",
      entityId: id,
      metadata: { movementType: parsed.data.type },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[POST /api/protocols/[id]/movement]", error)
    return NextResponse.json({ error: "Erro ao registrar movimentação" }, { status: 500 })
  }
}
