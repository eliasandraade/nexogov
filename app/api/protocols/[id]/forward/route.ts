import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { forwardProtocolValidator } from "@/validators/protocol.validator"
import { ProtocolService } from "@/services/protocol.service"
import { canForwardProtocol } from "@/lib/permissions"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  if (!canForwardProtocol(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão para encaminhar protocolos" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = forwardProtocolValidator.safeParse({ ...body, protocolId: id })

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    )
  }

  try {
    await ProtocolService.forward(
      id,
      {
        description: parsed.data.description,
        notes: parsed.data.notes,
        toSecretariatId: parsed.data.toSecretariatId,
        toOrganId: parsed.data.toOrganId || undefined,
        toSectorId: parsed.data.toSectorId || undefined,
        ccDestinations: parsed.data.ccDestinations,
      },
      session.user.id
    )
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[POST /api/protocols/[id]/forward]", error)
    return NextResponse.json({ error: "Erro ao encaminhar protocolo" }, { status: 500 })
  }
}
