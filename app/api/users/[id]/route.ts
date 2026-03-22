import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { updateUserValidator } from "@/validators/user.validator"
import { canManageUsers } from "@/lib/permissions"
import { logAudit } from "@/lib/audit/log"
import bcrypt from "bcryptjs"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || !canManageUsers(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = updateUserValidator.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { password, secretariatId, organId, sectorId, ...rest } = parsed.data

  const data: Record<string, unknown> = {
    ...rest,
    secretariatId: secretariatId === "" ? null : secretariatId,
    organId: organId === "" ? null : organId,
    sectorId: sectorId === "" ? null : sectorId,
  }

  if (password) {
    data.passwordHash = await bcrypt.hash(password, 12)
  }

  const user = await prisma.user.update({ where: { id }, data })

  await logAudit({
    action: "USER_UPDATED",
    userId: session.user.id,
    secretariatId: session.user.secretariatId ?? undefined,
    entityType: "User",
    entityId: id,
    metadata: rest,
    ip: req.headers.get("x-forwarded-for") ?? undefined,
  })

  return NextResponse.json(user)
}
