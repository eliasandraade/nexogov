import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { createProtocolValidator } from "@/validators/protocol.validator"
import { ProtocolService } from "@/services/protocol.service"
import { canCreateProtocol } from "@/lib/permissions"

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  if (!canCreateProtocol(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão para criar protocolos" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = createProtocolValidator.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    )
  }

  try {
    const protocol = await ProtocolService.create(parsed.data, session.user.id)
    return NextResponse.json({ id: protocol.id, number: protocol.number }, { status: 201 })
  } catch (error) {
    console.error("[POST /api/protocols]", error)
    return NextResponse.json({ error: "Erro interno ao criar protocolo" }, { status: 500 })
  }
}
