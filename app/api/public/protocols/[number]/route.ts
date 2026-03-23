import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { publicProtocolLookupValidator } from "@/validators/document.validator"
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  const rl = rateLimit(`public-protocol:${ip}`, { maxRequests: 30, windowSeconds: 60 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em alguns minutos." },
      { status: 429, headers: getRateLimitHeaders(rl) }
    )
  }

  const { number } = await params

  const parsed = publicProtocolLookupValidator.safeParse({ number })
  if (!parsed.success) {
    return NextResponse.json({ error: "Número de protocolo inválido" }, { status: 400 })
  }

  const protocol = await prisma.protocol.findUnique({
    where: { number: parsed.data.number },
    select: {
      number: true,
      title: true,
      type: true,
      status: true,
      createdAt: true,
      currentSecretariat: { select: { name: true, code: true } },
      currentSector: { select: { name: true } },
      movements: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          type: true,
          description: true,
          notes: true,
          isInterSecretariat: true,
          fromSecretariat: { select: { name: true, code: true } },
          fromSector: { select: { name: true } },
          toSecretariat: { select: { name: true, code: true } },
          toSector: { select: { name: true } },
          performedBy: { select: { name: true } },
          createdAt: true,
        },
      },
    },
  })

  if (!protocol) {
    return NextResponse.json({ error: "Protocolo não encontrado" }, { status: 404 })
  }

  return NextResponse.json(protocol)
}
