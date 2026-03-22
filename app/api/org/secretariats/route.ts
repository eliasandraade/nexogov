import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"

// Returns active secretariats + their sectors — used by forwarding modal and forms
export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const [secretariats, sectors] = await Promise.all([
    prisma.secretariat.findMany({
      where: { active: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    }),
    prisma.sector.findMany({
      where: { active: true },
      select: { id: true, name: true, code: true, secretariatId: true, organId: true },
      orderBy: { name: "asc" },
    }),
  ])

  return NextResponse.json({ secretariats, sectors })
}
