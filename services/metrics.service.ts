import { prisma } from "@/lib/prisma"

export interface SecretariatMetrics {
  id: string
  name: string
  code: string
  current: {
    total: number
    open: number
    inProgress: number
    pending: number
    deferred: number
  }
  originated: {
    total: number
    closed: number
    avgDaysToClose: number | null
  }
}

export class MetricsService {
  static async getSecretariatMetrics(): Promise<SecretariatMetrics[]> {
    const secretariats = await prisma.secretariat.findMany({
      where: { active: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    })

    const metrics = await Promise.all(
      secretariats.map(async (s) => {
        const [currentByStatus, originatedTotal, closedProtocols] = await Promise.all([
          // Protocols currently at this secretariat, grouped by status
          prisma.protocol.groupBy({
            by: ["status"],
            where: { currentSecretariatId: s.id },
            _count: { status: true },
          }),
          // Protocols that originated from this secretariat
          prisma.protocol.count({
            where: { originSecretariatId: s.id },
          }),
          // Closed protocols originated from this secretariat (for avg time)
          prisma.protocol.findMany({
            where: {
              originSecretariatId: s.id,
              status: "CLOSED",
              closedAt: { not: null },
            },
            select: { createdAt: true, closedAt: true },
          }),
        ])

        const statusMap = Object.fromEntries(
          currentByStatus.map((g) => [g.status, g._count.status])
        )

        const avgDaysToClose =
          closedProtocols.length > 0
            ? Math.round(
                (closedProtocols.reduce((acc, p) => {
                  const days =
                    (p.closedAt!.getTime() - p.createdAt.getTime()) / 86400000
                  return acc + days
                }, 0) /
                  closedProtocols.length) *
                  10
              ) / 10
            : null

        const currentTotal = Object.values(statusMap).reduce((a, b) => a + b, 0)

        return {
          id: s.id,
          name: s.name,
          code: s.code,
          current: {
            total: currentTotal,
            open: statusMap.OPEN ?? 0,
            inProgress: statusMap.IN_PROGRESS ?? 0,
            pending: statusMap.PENDING ?? 0,
            deferred: statusMap.DEFERRED ?? 0,
          },
          originated: {
            total: originatedTotal,
            closed: closedProtocols.length,
            avgDaysToClose,
          },
        }
      })
    )

    return metrics
  }

  static async getProtocolElapsedDays(protocolId: string): Promise<{
    elapsedDays: number
    isClosed: boolean
  } | null> {
    const protocol = await prisma.protocol.findUnique({
      where: { id: protocolId },
      select: { createdAt: true, closedAt: true, status: true },
    })
    if (!protocol) return null

    const isClosed = protocol.status === "CLOSED" && !!protocol.closedAt
    const endDate = isClosed ? protocol.closedAt! : new Date()
    const elapsedDays = Math.floor(
      (endDate.getTime() - protocol.createdAt.getTime()) / 86400000
    )

    return { elapsedDays, isClosed }
  }
}
