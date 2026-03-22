import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { createOrganValidator } from "@/validators/organization.validator"
import { canManageOrganizationalStructure } from "@/lib/permissions"
import { logAudit } from "@/lib/audit/log"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const organs = await prisma.organ.findMany({
    orderBy: { name: "asc" },
    include: {
      secretariat: { select: { name: true, code: true } },
      _count: { select: { sectors: true, users: true } },
    },
  })

  return NextResponse.json(organs)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !canManageOrganizationalStructure(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = createOrganValidator.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const organ = await prisma.organ.create({ data: parsed.data })

  await logAudit({
    action: "ORGAN_CREATED",
    userId: session.user.id,
    secretariatId: session.user.secretariatId ?? undefined,
    entityType: "Organ",
    entityId: organ.id,
    metadata: parsed.data,
  })

  return NextResponse.json(organ, { status: 201 })
}
