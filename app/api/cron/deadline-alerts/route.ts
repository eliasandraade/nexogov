import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Called by a cron job (e.g. Railway cron or external scheduler)
// Protected by a simple secret token
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")
  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  // Protocols expiring in next 3 days, not yet closed
  const expiring = await prisma.protocol.findMany({
    where: {
      deadlineAt: { gte: now, lte: in3Days },
      status: { notIn: ["CLOSED", "ARCHIVED", "REJECTED"] },
    },
    select: {
      id: true,
      number: true,
      title: true,
      deadlineAt: true,
      currentSecretariatId: true,
      createdById: true,
    },
  })

  if (expiring.length === 0) return NextResponse.json({ notified: 0 })

  let notified = 0

  for (const p of expiring) {
    const daysLeft = Math.ceil((p.deadlineAt!.getTime() - now.getTime()) / 86400000)

    // Notify users in the current secretariat
    const targets = await prisma.user.findMany({
      where: { secretariatId: p.currentSecretariatId, active: true },
      select: { id: true },
    })

    // Also notify watchers
    const watchers = await prisma.protocolWatch.findMany({
      where: { protocolId: p.id },
      select: { userId: true },
    })

    const userIds = [...new Set([
      ...targets.map(u => u.id),
      ...watchers.map(w => w.userId),
    ])]

    if (userIds.length === 0) continue

    // Avoid duplicate notifications: check if already notified today
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const alreadySent = await prisma.notification.count({
      where: {
        entityId: p.id,
        type: "DEADLINE_ALERT",
        createdAt: { gte: today },
      },
    })
    if (alreadySent > 0) continue

    await prisma.notification.createMany({
      data: userIds.map(userId => ({
        userId,
        type: "DEADLINE_ALERT",
        title: `Prazo em ${daysLeft} dia${daysLeft !== 1 ? "s" : ""}`,
        body: `Protocolo ${p.number} — "${p.title}" vence em ${daysLeft} dia${daysLeft !== 1 ? "s" : ""}.`,
        entityType: "Protocol",
        entityId: p.id,
      })),
      skipDuplicates: true,
    })

    notified += userIds.length
  }

  return NextResponse.json({ checked: expiring.length, notified })
}
