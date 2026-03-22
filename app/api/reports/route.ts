import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { canViewDashboard } from "@/lib/permissions"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || !canViewDashboard(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const secretariatId = searchParams.get("secretariatId")
  const status = searchParams.get("status")
  const format = searchParams.get("format") ?? "json"

  const where: Record<string, unknown> = {}
  if (secretariatId) where.currentSecretariatId = secretariatId
  if (status) where.status = status
  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    }
  }

  const protocols = await prisma.protocol.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      number: true,
      title: true,
      type: true,
      status: true,
      priority: true,
      createdAt: true,
      closedAt: true,
      deadlineAt: true,
      requesterName: true,
      originSecretariat: { select: { code: true, name: true } },
      currentSecretariat: { select: { code: true, name: true } },
      currentSector: { select: { name: true } },
      createdBy: { select: { name: true } },
      _count: { select: { movements: true, documents: true } },
    },
  })

  if (format === "csv") {
    const rows = [
      ["Número", "Título", "Tipo", "Status", "Prioridade", "Secretaria Origem", "Secretaria Atual", "Setor Atual", "Criado em", "Encerrado em", "Prazo", "Movimentações", "Documentos"],
      ...protocols.map((p) => [
        p.number,
        `"${p.title.replace(/"/g, '""')}"`,
        p.type,
        p.status,
        p.priority,
        p.originSecretariat.code,
        p.currentSecretariat.code,
        p.currentSector?.name ?? "",
        p.createdAt.toISOString().split("T")[0],
        p.closedAt ? p.closedAt.toISOString().split("T")[0] : "",
        p.deadlineAt ? p.deadlineAt.toISOString().split("T")[0] : "",
        p._count.movements,
        p._count.documents,
      ]),
    ]
    const csv = rows.map((r) => r.join(";")).join("\n")
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="nexogov-relatorio-${Date.now()}.csv"`,
      },
    })
  }

  return NextResponse.json(protocols)
}
