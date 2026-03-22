import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { createSectorValidator } from "@/validators/organization.validator"
import { canManageOrganizationalStructure } from "@/lib/permissions"
import { logAudit } from "@/lib/audit/log"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const sectors = await prisma.sector.findMany({
    orderBy: { name: "asc" },
    include: {
      secretariat: { select: { name: true, code: true } },
      organ: { select: { name: true } },
      _count: { select: { users: true } },
    },
  })

  return NextResponse.json(sectors)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !canManageOrganizationalStructure(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = createSectorValidator.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = {
    ...parsed.data,
    organId: parsed.data.organId || null,
  }

  const sector = await prisma.sector.create({ data })

  await logAudit({
    action: "SECTOR_CREATED",
    userId: session.user.id,
    secretariatId: session.user.secretariatId ?? undefined,
    entityType: "Sector",
    entityId: sector.id,
    metadata: parsed.data,
    ip: req.headers.get("x-forwarded-for") ?? undefined,
  })

  return NextResponse.json(sector, { status: 201 })
}
