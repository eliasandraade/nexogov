import { prisma } from "@/lib/prisma"
import { AuditAction } from "@prisma/client"
import { headers } from "next/headers"

interface AuditLogInput {
  action: AuditAction
  userId?: string
  secretariatId?: string
  entityType?: string
  entityId?: string
  metadata?: Record<string, unknown>
}

/**
 * Records an audit log entry. Safe to call from server actions and route handlers.
 * Never throws — audit failures must not break application flow.
 */
export async function logAudit(input: AuditLogInput): Promise<void> {
  try {
    const headersList = await headers()
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headersList.get("x-real-ip") ??
      "unknown"
    const userAgent = headersList.get("user-agent") ?? "unknown"

    await prisma.auditLog.create({
      data: {
        action: input.action,
        userId: input.userId ?? null,
        secretariatId: input.secretariatId ?? null,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        metadata: input.metadata as any ?? undefined,
        ip,
        userAgent,
      },
    })
  } catch (error) {
    // Audit log failure should never crash the app
    console.error("[AuditLog] Failed to write audit log:", error)
  }
}

interface DocumentAccessLogInput {
  documentId: string
  protocolId: string
  userId?: string
  accessType: "VIEW" | "DOWNLOAD" | "PREVIEW" | "INVALID_ATTEMPT"
  accessOrigin: "INTERNAL_AUTHENTICATED" | "EXTERNAL_NUMBER_PASSWORD" | "EXTERNAL_INVALID_ATTEMPT"
  routeReference?: string
  accessChannel?: string
  success: boolean
  failReason?: string
}

/**
 * Records a document access log entry (critical — required by business rules).
 */
export async function logDocumentAccess(input: DocumentAccessLogInput): Promise<void> {
  try {
    const headersList = await headers()
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headersList.get("x-real-ip") ??
      "unknown"
    const userAgent = headersList.get("user-agent") ?? "unknown"

    await prisma.documentAccessLog.create({
      data: {
        documentId: input.documentId,
        protocolId: input.protocolId,
        userId: input.userId ?? null,
        accessType: input.accessType,
        accessOrigin: input.accessOrigin,
        routeReference: input.routeReference ?? null,
        accessChannel: input.accessChannel ?? "web",
        ip,
        userAgent,
        success: input.success,
        failReason: input.failReason ?? null,
      },
    })
  } catch (error) {
    console.error("[DocumentAccessLog] Failed to write document access log:", error)
  }
}
