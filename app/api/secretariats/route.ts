import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { createSecretariatValidator } from "@/validators/organization.validator"
import { canManageOrganizationalStructure } from "@/lib/permissions"
import { logAudit } from "@/lib/audit/log"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !canManageOrganizationalStructure(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = createSecretariatValidator.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const existing = await prisma.secretariat.findUnique({ where: { code: parsed.data.code } })
  if (existing) {
    return NextResponse.json({ error: "Código já cadastrado" }, { status: 409 })
  }

  const secretariat = await prisma.secretariat.create({ data: parsed.data })

  await logAudit({
    action: "SECRETARIAT_CREATED",
    userId: session.user.id,
    entityType: "Secretariat",
    entityId: secretariat.id,
    metadata: parsed.data,
  })

  return NextResponse.json(secretariat, { status: 201 })
}
