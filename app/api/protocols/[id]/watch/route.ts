import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  const { id } = await params
  const watch = await prisma.protocolWatch.findUnique({
    where: { protocolId_userId: { protocolId: id, userId: session.user.id } },
  })
  return NextResponse.json({ watching: !!watch })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  const { id } = await params
  await prisma.protocolWatch.upsert({
    where: { protocolId_userId: { protocolId: id, userId: session.user.id } },
    create: { protocolId: id, userId: session.user.id },
    update: {},
  })
  return NextResponse.json({ watching: true })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  const { id } = await params
  await prisma.protocolWatch.deleteMany({
    where: { protocolId: id, userId: session.user.id },
  })
  return NextResponse.json({ watching: false })
}
