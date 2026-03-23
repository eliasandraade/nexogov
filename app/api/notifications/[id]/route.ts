import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { NotificationService } from "@/services/notification.service"

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const { id } = await params
  await NotificationService.markRead(id, session.user.id)
  return NextResponse.json({ ok: true })
}
