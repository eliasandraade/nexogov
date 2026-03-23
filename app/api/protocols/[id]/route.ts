import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { canForwardProtocol } from "@/lib/permissions"
import { logAudit } from "@/lib/audit/log"
import { updateProtocolMetadataValidator } from "@/validators/protocol.validator"

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
  const parsed = updateProtocolMetadataValidator.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    )
  }

  try {
    const protocol = await prisma.protocol.findUnique({
      where: { id },
      select: { status: true },
    })

    if (!protocol) {
      return NextResponse.json({ error: "Protocolo não encontrado" }, { status: 404 })
    }
    if (protocol.status === "CLOSED" || protocol.status === "ARCHIVED") {
      return NextResponse.json({ error: "Protocolo encerrado ou arquivado" }, { status: 400 })
    }

    const { deadlineAt, ...rest } = parsed.data

    const deadlineValue =
      deadlineAt === ""
        ? null
        : deadlineAt
        ? new Date(deadlineAt)
        : undefined

    await prisma.protocol.update({
      where: { id },
      data: {
        ...rest,
        ...(deadlineValue !== undefined ? { deadlineAt: deadlineValue } : {}),
      },
    })

    await logAudit({
      action: "PROTOCOL_UPDATED",
      userId: session.user.id,
      secretariatId: session.user.secretariatId ?? undefined,
      entityType: "Protocol",
      entityId: id,
      metadata: { fields: Object.keys(parsed.data) },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[PATCH /api/protocols/[id]]", error)
    return NextResponse.json({ error: "Erro ao atualizar protocolo" }, { status: 500 })
  }
}
