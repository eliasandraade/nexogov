import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"

const ADMIN_ROLES = new Set(["ADMIN_SISTEMA", "DEV", "ADMIN"])

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || !ADMIN_ROLES.has(session.user.role)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const entity = searchParams.get("entity")

  switch (entity) {
    case "protocols":
      return exportProtocols(searchParams)
    case "movements":
      return exportMovements(searchParams)
    case "flows":
      return exportFlows()
    case "secretariats":
      return exportSecretariats()
    default:
      return NextResponse.json(
        {
          error: "Parâmetro 'entity' inválido",
          available: ["protocols", "movements", "flows", "secretariats"],
        },
        { status: 400 }
      )
  }
}

async function exportProtocols(params: URLSearchParams) {
  const from = params.get("from")
  const to = params.get("to")

  const where: Record<string, any> = {}
  if (from || to) {
    where.createdAt = {}
    if (from) where.createdAt.gte = new Date(from)
    if (to) {
      const toDate = new Date(to)
      toDate.setHours(23, 59, 59, 999)
      where.createdAt.lte = toDate
    }
  }

  const protocols = await prisma.protocol.findMany({
    where,
    take: 5000,
    select: {
      id: true,
      number: true,
      title: true,
      type: true,
      status: true,
      priority: true,
      requesterName: true,
      createdAt: true,
      updatedAt: true,
      closedAt: true,
      deadlineAt: true,
      originSecretariat: { select: { code: true, name: true } },
      originSector: { select: { name: true } },
      currentSecretariat: { select: { code: true, name: true } },
      currentSector: { select: { name: true } },
      createdBy: { select: { name: true } },
      _count: { select: { movements: true, documents: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  const csv = toCSV(
    [
      "number", "title", "type", "status", "priority",
      "requester", "origin_secretariat", "origin_sector",
      "current_secretariat", "current_sector",
      "created_by", "created_at", "closed_at", "deadline_at",
      "movements_count", "documents_count",
    ],
    protocols.map((p) => [
      p.number, p.title, p.type, p.status, p.priority,
      p.requesterName ?? "",
      p.originSecretariat.code, p.originSector?.name ?? "",
      p.currentSecretariat.code, p.currentSector?.name ?? "",
      p.createdBy.name,
      p.createdAt.toISOString(), p.closedAt?.toISOString() ?? "",
      p.deadlineAt?.toISOString() ?? "",
      String(p._count.movements), String(p._count.documents),
    ])
  )

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="protocols_export_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}

async function exportMovements(params: URLSearchParams) {
  const from = params.get("from")
  const to = params.get("to")

  const where: Record<string, any> = {}
  if (from || to) {
    where.createdAt = {}
    if (from) where.createdAt.gte = new Date(from)
    if (to) {
      const toDate = new Date(to)
      toDate.setHours(23, 59, 59, 999)
      where.createdAt.lte = toDate
    }
  }

  const movements = await prisma.movement.findMany({
    where,
    take: 10000,
    select: {
      id: true,
      type: true,
      description: true,
      isInterSecretariat: true,
      createdAt: true,
      protocol: { select: { number: true } },
      fromSecretariat: { select: { code: true } },
      fromSector: { select: { name: true } },
      toSecretariat: { select: { code: true } },
      toSector: { select: { name: true } },
      performedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  const csv = toCSV(
    [
      "protocol_number", "type", "description", "is_inter_secretariat",
      "from_secretariat", "from_sector", "to_secretariat", "to_sector",
      "performed_by", "created_at",
    ],
    movements.map((m) => [
      m.protocol.number, m.type, m.description,
      String(m.isInterSecretariat),
      m.fromSecretariat?.code ?? "", m.fromSector?.name ?? "",
      m.toSecretariat?.code ?? "", m.toSector?.name ?? "",
      m.performedBy.name, m.createdAt.toISOString(),
    ])
  )

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="movements_export_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}

async function exportFlows() {
  const flows = await prisma.movement.groupBy({
    by: ["fromSecretariatId", "toSecretariatId"],
    where: {
      isInterSecretariat: true,
      fromSecretariatId: { not: null },
      toSecretariatId: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  })

  const ids = [
    ...new Set([
      ...flows.map((f) => f.fromSecretariatId!),
      ...flows.map((f) => f.toSecretariatId!),
    ]),
  ]
  const secretariats = await prisma.secretariat.findMany({
    where: { id: { in: ids } },
    select: { id: true, code: true, name: true },
  })
  const map = Object.fromEntries(secretariats.map((s) => [s.id, s]))

  const csv = toCSV(
    ["from_code", "from_name", "to_code", "to_name", "count"],
    flows.map((f) => [
      map[f.fromSecretariatId!]?.code ?? "", map[f.fromSecretariatId!]?.name ?? "",
      map[f.toSecretariatId!]?.code ?? "", map[f.toSecretariatId!]?.name ?? "",
      String(f._count.id),
    ])
  )

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="flows_export_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}

async function exportSecretariats() {
  const secretariats = await prisma.secretariat.findMany({
    select: {
      code: true,
      name: true,
      active: true,
      _count: {
        select: {
          protocolsCurrentlyHere: true,
          sectors: true,
          users: true,
        },
      },
    },
    orderBy: { code: "asc" },
  })

  const csv = toCSV(
    ["code", "name", "active", "protocols_count", "sectors_count", "users_count"],
    secretariats.map((s) => [
      s.code, s.name, String(s.active),
      String(s._count.protocolsCurrentlyHere),
      String(s._count.sectors),
      String(s._count.users),
    ])
  )

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="secretariats_export_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}

function toCSV(headers: string[], rows: string[][]): string {
  const escape = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`
    }
    return val
  }
  const lines = [headers.map(escape).join(",")]
  for (const row of rows) {
    lines.push(row.map(escape).join(","))
  }
  return "\uFEFF" + lines.join("\n") // BOM for Excel UTF-8
}
