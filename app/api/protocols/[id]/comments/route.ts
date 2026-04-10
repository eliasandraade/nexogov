import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod/v4"

const createCommentSchema = z.object({
  body: z.string().min(1).max(2000),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const { id } = await params
  const comments = await prisma.comment.findMany({
    where: { protocolId: id },
    orderBy: { createdAt: "asc" },
    take: 50,
    select: {
      id: true,
      body: true,
      createdAt: true,
      author: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(comments)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = createCommentSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Texto inválido" }, { status: 400 })

  const comment = await prisma.comment.create({
    data: {
      protocolId: id,
      authorId: session.user.id,
      body: parsed.data.body,
    },
    select: {
      id: true,
      body: true,
      createdAt: true,
      author: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(comment, { status: 201 })
}
