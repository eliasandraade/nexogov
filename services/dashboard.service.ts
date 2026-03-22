import { prisma } from "@/lib/prisma"

export class DashboardService {
  static async getMetrics() {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      totalProtocols,
      byStatus,
      bySecretariat,
      overdueProtocols,
      recentProtocols,
      avgTramitacao,
      topSecretariatFlows,
      recentAuditLogs,
      documentAccessAttempts,
    ] = await Promise.all([
      // Total
      prisma.protocol.count(),

      // By status
      prisma.protocol.groupBy({
        by: ["status"],
        _count: { status: true },
        orderBy: { _count: { status: "desc" } },
      }),

      // By current secretariat
      prisma.protocol.groupBy({
        by: ["currentSecretariatId"],
        _count: { currentSecretariatId: true },
        orderBy: { _count: { currentSecretariatId: "desc" } },
        take: 8,
      }),

      // Overdue (past deadline and not closed)
      prisma.protocol.count({
        where: {
          deadlineAt: { lt: now },
          status: { notIn: ["CLOSED", "ARCHIVED"] },
        },
      }),

      // Created in last 30 days
      prisma.protocol.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),

      // Average tramitation time for closed protocols (in days)
      prisma.protocol.aggregate({
        where: {
          status: "CLOSED",
          closedAt: { not: null },
        },
        _avg: { year: true }, // placeholder — real avg below
      }),

      // Most frequent inter-secretariat flows
      prisma.movement.groupBy({
        by: ["fromSecretariatId", "toSecretariatId"],
        where: {
          isInterSecretariat: true,
          fromSecretariatId: { not: null },
          toSecretariatId: { not: null },
        },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),

      // Recent audit logs
      prisma.auditLog.findMany({
        take: 15,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          createdAt: true,
          user: { select: { name: true } },
          secretariat: { select: { code: true } },
        },
      }),

      // Invalid document access attempts in last 7 days
      prisma.documentAccessLog.count({
        where: {
          accessType: "INVALID_ATTEMPT",
          createdAt: { gte: sevenDaysAgo },
        },
      }),
    ])

    // Enrich secretariat data
    const secretariatIds = bySecretariat.map((s) => s.currentSecretariatId)
    const flowSecretariatIds = [
      ...new Set([
        ...topSecretariatFlows.map((f) => f.fromSecretariatId).filter(Boolean),
        ...topSecretariatFlows.map((f) => f.toSecretariatId).filter(Boolean),
      ]),
    ] as string[]

    const [secretariats, flowSecretariats] = await Promise.all([
      prisma.secretariat.findMany({
        where: { id: { in: secretariatIds } },
        select: { id: true, name: true, code: true },
      }),
      prisma.secretariat.findMany({
        where: { id: { in: flowSecretariatIds } },
        select: { id: true, name: true, code: true },
      }),
    ])

    const secretariatMap = Object.fromEntries(secretariats.map((s) => [s.id, s]))
    const flowSecretariatMap = Object.fromEntries(flowSecretariats.map((s) => [s.id, s]))

    // Compute real avg tramitation in days for closed protocols
    const closedProtocols = await prisma.protocol.findMany({
      where: { status: "CLOSED", closedAt: { not: null } },
      select: { createdAt: true, closedAt: true },
      take: 200,
    })
    const avgDays =
      closedProtocols.length === 0
        ? null
        : closedProtocols.reduce((acc, p) => {
            const diff = (p.closedAt!.getTime() - p.createdAt.getTime()) / 86400000
            return acc + diff
          }, 0) / closedProtocols.length

    const statusMap = Object.fromEntries(byStatus.map((s) => [s.status, s._count.status]))

    return {
      totalProtocols,
      openCount: statusMap.OPEN ?? 0,
      inProgressCount: statusMap.IN_PROGRESS ?? 0,
      pendingCount: statusMap.PENDING ?? 0,
      closedCount: statusMap.CLOSED ?? 0,
      archivedCount: statusMap.ARCHIVED ?? 0,
      overdueProtocols,
      recentProtocols,
      avgTramitationDays: avgDays ? Math.round(avgDays * 10) / 10 : null,

      bySecretariat: bySecretariat.map((s) => ({
        secretariat: secretariatMap[s.currentSecretariatId],
        count: s._count.currentSecretariatId,
      })),

      topFlows: topSecretariatFlows.map((f) => ({
        from: flowSecretariatMap[f.fromSecretariatId!],
        to: flowSecretariatMap[f.toSecretariatId!],
        count: f._count.id,
      })),

      recentAuditLogs,
      documentAccessAttempts,
    }
  }
}
