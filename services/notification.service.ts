import { prisma } from "@/lib/prisma"

interface CreateNotificationInput {
  type: string
  title: string
  body: string
  entityType?: string
  entityId?: string
}

export class NotificationService {
  static async createForSecretariat(
    secretariatId: string,
    input: CreateNotificationInput,
    excludeUserId?: string
  ) {
    const users = await prisma.user.findMany({
      where: { secretariatId, active: true },
      select: { id: true },
    })
    const targets = excludeUserId
      ? users.filter((u) => u.id !== excludeUserId)
      : users
    if (targets.length === 0) return
    await prisma.notification.createMany({
      data: targets.map((u) => ({ userId: u.id, ...input })),
    })
  }

  static async createForUser(
    userId: string,
    input: CreateNotificationInput
  ) {
    await prisma.notification.create({ data: { userId, ...input } })
  }

  static async getForUser(userId: string, limit = 30) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
  }

  static async countUnread(userId: string) {
    return prisma.notification.count({ where: { userId, read: false } })
  }

  static async markRead(id: string, userId: string) {
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    })
  }

  static async markAllRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    })
  }
}
