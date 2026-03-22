import { NextRequest, NextResponse } from "next/server"
import { DocumentService } from "@/services/document.service"
import { documentAccessValidator } from "@/validators/document.validator"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = documentAccessValidator.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    )
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  const userAgent = req.headers.get("user-agent") ?? "unknown"

  const result = await DocumentService.getDocumentsWithPasswordAuth(
    parsed.data.protocolNumber,
    parsed.data.protocolPassword,
    { ip, userAgent, routeReference: "/consulta/documentos" }
  )

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 401 })
  }

  return NextResponse.json({ documents: result.documents })
}
