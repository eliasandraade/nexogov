import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { isSecretariatScoped } from "@/lib/permissions"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const q = req.nextUrl.searchParams.get("q")?.trim()
  if (!q || q.length < 2) return NextResponse.json([])

  const userSecretariatId = session.user.secretariatId ?? null
  const scoped = isSecretariatScoped(session.user.role) && userSecretariatId

  const scopeFilter = scoped ? {
    OR: [
      { originSecretariatId: userSecretariatId },
      { currentSecretariatId: userSecretariatId },
      { movements: { some: { OR: [
        { fromSecretariatId: userSecretariatId },
        { toSecretariatId: userSecretariatId },
      ]}}},
    ]
  } : {}

  const protocols = await prisma.protocol.findMany({
    where: {
      AND: [
        scopeFilter,
        { OR: [
          { number: { contains: q, mode: "insensitive" } },
          { title: { contains: q, mode: "insensitive" } },
          { requesterName: { contains: q, mode: "insensitive" } },
        ]}
      ]
    },
    take: 8,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      number: true,
      title: true,
      status: true,
      currentSecretariat: { select: { code: true } },
    },
  })

  return NextResponse.json(protocols)
}
