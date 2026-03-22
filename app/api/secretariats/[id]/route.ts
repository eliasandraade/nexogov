import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { canManageOrganizationalStructure } from "@/lib/permissions"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || !canManageOrganizationalStructure(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()

  const secretariat = await prisma.secretariat.update({
    where: { id },
    data: {
      name: body.name,
      code: body.code,
      description: body.description,
      active: body.active,
    },
  })

  return NextResponse.json(secretariat)
}
