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

    // Temporal data: protocols created per month (last 12 months)
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
    const [temporalRaw, allFlows, flowSecretariatsList] = await Promise.all([
      prisma.protocol.findMany({
        where: { createdAt: { gte: twelveMonthsAgo } },
        select: { createdAt: true },
      }),
      prisma.movement.groupBy({
        by: ["fromSecretariatId", "toSecretariatId"],
        where: {
          isInterSecretariat: true,
          fromSecretariatId: { not: null },
          toSecretariatId: { not: null },
        },
        _count: { id: true },
      }),
      prisma.secretariat.findMany({
        where: { active: true },
        select: { id: true, code: true },
        orderBy: { code: "asc" },
      }),
    ])

    // Build monthly counts
    const monthCounts = new Map<string, number>()
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      monthCounts.set(key, 0)
    }
    for (const p of temporalRaw) {
      const key = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, "0")}`
      if (monthCounts.has(key)) monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1)
    }
    const monthLabels: Record<string, string> = {
      "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr", "05": "Mai", "06": "Jun",
      "07": "Jul", "08": "Ago", "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
    }
    const temporalData = Array.from(monthCounts.entries()).map(([key, count]) => ({
      month: monthLabels[key.split("-")[1]] ?? key,
      count,
    }))

    // Build flow matrix data
    const flowMatrixData = allFlows.map((f) => ({
      fromId: f.fromSecretariatId!,
      toId: f.toSecretariatId!,
      count: f._count.id,
    }))

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

      temporalData,
      flowMatrixData,
      flowSecretariats: flowSecretariatsList,
    }
  }

  static async getMetricsForSecretariat(secretariatId: string) {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const involvementFilter = {
      OR: [
        { originSecretariatId: secretariatId },
        { currentSecretariatId: secretariatId },
        {
          movements: {
            some: {
              OR: [
                { fromSecretariatId: secretariatId },
                { toSecretariatId: secretariatId },
              ],
            },
          },
        },
      ],
    }

    const [
      totalProtocols,
      byStatus,
      overdueProtocols,
      recentProtocols,
      inQueueCount,
      staffCount,
      topFlowsRaw,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.protocol.count({ where: involvementFilter }),

      prisma.protocol.groupBy({
        by: ["status"],
        where: involvementFilter,
        _count: { status: true },
      }),

      prisma.protocol.count({
        where: {
          ...involvementFilter,
          deadlineAt: { lt: now },
          status: { notIn: ["CLOSED", "ARCHIVED"] },
        },
      }),

      prisma.protocol.count({
        where: { ...involvementFilter, createdAt: { gte: thirtyDaysAgo } },
      }),

      prisma.protocol.count({
        where: { currentSecretariatId: secretariatId },
      }),

      prisma.user.count({
        where: { secretariatId, active: true },
      }),

      prisma.movement.groupBy({
        by: ["fromSecretariatId", "toSecretariatId"],
        where: {
          fromSecretariatId: secretariatId,
          isInterSecretariat: true,
          toSecretariatId: { not: null },
        },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),

      prisma.auditLog.findMany({
        take: 15,
        orderBy: { createdAt: "desc" },
        where: { secretariatId },
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
    ])

    // Temporal data: protocols involving this secretariat per month (last 12 months)
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
    const temporalRaw = await prisma.protocol.findMany({
      where: { ...involvementFilter, createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true },
    })

    const monthCounts = new Map<string, number>()
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      monthCounts.set(key, 0)
    }
    for (const p of temporalRaw) {
      const key = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, "0")}`
      if (monthCounts.has(key)) monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1)
    }
    const monthLabels: Record<string, string> = {
      "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr", "05": "Mai", "06": "Jun",
      "07": "Jul", "08": "Ago", "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
    }
    const temporalData = Array.from(monthCounts.entries()).map(([key, count]) => ({
      month: monthLabels[key.split("-")[1]] ?? key,
      count,
    }))

    // Avg tramitation for closed protocols in this secretariat
    const closedProtocols = await prisma.protocol.findMany({
      where: { ...involvementFilter, status: "CLOSED", closedAt: { not: null } },
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

    // Enrich topFlows with secretariat names
    const toSecretariatIds = topFlowsRaw
      .map((f) => f.toSecretariatId)
      .filter((id): id is string => id !== null)
    const toSecretariats = await prisma.secretariat.findMany({
      where: { id: { in: toSecretariatIds } },
      select: { id: true, name: true, code: true },
    })
    const toSecretariatMap = Object.fromEntries(toSecretariats.map((s) => [s.id, s]))

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
      inQueueCount,
      staffCount,
      avgTramitationDays: avgDays ? Math.round(avgDays * 10) / 10 : null,
      temporalData,
      recentAuditLogs,
      topFlowsFromHere: topFlowsRaw.map((f) => ({
        to: f.toSecretariatId ? toSecretariatMap[f.toSecretariatId] : undefined,
        count: f._count.id,
      })),
    }
  }
}
