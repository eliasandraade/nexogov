import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { createUserValidator } from "@/validators/user.validator"
import { canManageUsers, canManageSecretariatUsers, SECRETARIAT_ASSIGNABLE_ROLES } from "@/lib/permissions"
import { logAudit } from "@/lib/audit/log"
import bcrypt from "bcryptjs"

export async function GET() {
  const session = await auth()
  if (!session || !canManageUsers(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const where = canManageSecretariatUsers(session.user.role) && session.user.secretariatId
    ? { secretariatId: session.user.secretariatId }
    : undefined

  const users = await prisma.user.findMany({
    where,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
      secretariat: { select: { name: true, code: true } },
      organ: { select: { name: true } },
      sector: { select: { name: true } },
    },
  })

  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !canManageUsers(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = createUserValidator.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  let { name, email, password, role, secretariatId, organId, sectorId } = parsed.data

  if (canManageSecretariatUsers(session.user.role)) {
    // SECRETARIO: force their own secretariat and restrict assignable roles
    secretariatId = session.user.secretariatId ?? secretariatId
    if (!SECRETARIAT_ASSIGNABLE_ROLES.includes(role)) {
      return NextResponse.json({ error: "Perfil não permitido para esta operação" }, { status: 403 })
    }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      secretariatId: secretariatId || null,
      organId: organId || null,
      sectorId: sectorId || null,
    },
  })

  await logAudit({
    action: "USER_CREATED",
    userId: session.user.id,
    secretariatId: session.user.secretariatId ?? undefined,
    entityType: "User",
    entityId: user.id,
    metadata: { name, email, role },
  })

  return NextResponse.json(user, { status: 201 })
}
