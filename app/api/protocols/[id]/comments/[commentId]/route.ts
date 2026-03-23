import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const { commentId } = await params
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  })

  if (!comment) return NextResponse.json({ error: "Comentário não encontrado" }, { status: 404 })
  if (comment.authorId !== session.user.id && !["ADMIN_SISTEMA", "DEV", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  await prisma.comment.delete({ where: { id: commentId } })
  return NextResponse.json({ ok: true })
}
