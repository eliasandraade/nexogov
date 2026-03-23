import { NextRequest, NextResponse } from "next/server"
import { DocumentService } from "@/services/document.service"
import { documentAccessValidator } from "@/validators/document.validator"
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"

  // Stricter rate limit for document access (password brute-force protection)
  const rl = rateLimit(`public-documents:${ip}`, { maxRequests: 10, windowSeconds: 60 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente." },
      { status: 429, headers: getRateLimitHeaders(rl) }
    )
  }

  const body = await req.json()
  const parsed = documentAccessValidator.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    )
  }
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
