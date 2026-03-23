import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { NotificationService } from "@/services/notification.service"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const [notifications, unreadCount] = await Promise.all([
    NotificationService.getForUser(session.user.id),
    NotificationService.countUnread(session.user.id),
  ])

  return NextResponse.json({ notifications, unreadCount })
}

export async function POST() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  await NotificationService.markAllRead(session.user.id)
  return NextResponse.json({ ok: true })
}
