import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit/log"
import { formatProtocolNumber } from "@/lib/utils/format"
import type { CreateProtocolInput } from "@/validators/protocol.validator"
import bcrypt from "bcryptjs"

export class ProtocolService {
  /**
   * Creates a new protocol with an auto-generated unique number.
   * Uses a transaction + UPDATE ... INCREMENT to guarantee uniqueness under concurrency.
   */
  static async create(input: CreateProtocolInput, createdById: string) {
    return prisma.$transaction(async (tx) => {
      const year = new Date().getFullYear()

      // Atomically increment the sequence
      const seqRecord = await tx.protocolSequence.upsert({
        where: { year },
        update: { lastSequence: { increment: 1 } },
        create: { year, lastSequence: 1 },
      })

      const number = formatProtocolNumber(year, seqRecord.lastSequence)
      const passwordHash = await bcrypt.hash(input.password, 10)

      const protocol = await tx.protocol.create({
        data: {
          number,
          year,
          sequence: seqRecord.lastSequence,
          passwordHash,
          title: input.title,
          description: input.description,
          type: input.type as any,
          status: "OPEN",
          priority: input.priority as any,
          requesterName: input.requesters?.[0]?.name || input.requesterName || null,
          requesterDocument: input.requesters?.[0]?.document || input.requesterDocument || null,
          requesters: input.requesters ?? [],
          internalNotes: input.internalNotes || null,
          originSecretariatId: input.originSecretariatId,
          originOrganId: input.originOrganId || null,
          originSectorId: input.originSectorId || null,
          currentSecretariatId: input.currentSecretariatId,
          currentOrganId: input.currentOrganId || null,
          currentSectorId: input.currentSectorId || null,
          deadlineAt: input.deadlineAt ? new Date(input.deadlineAt) : null,
          createdById,
        },
      })

      // Record initial movement
      await tx.movement.create({
        data: {
          protocolId: protocol.id,
          type: "CREATION",
          description: `Protocolo ${number} registrado no sistema.`,
          fromSecretariatId: input.originSecretariatId,
          fromSectorId: input.originSectorId || null,
          performedById: createdById,
        },
      })

      // Audit log (outside tx to not block — fire and forget pattern handled in logAudit)
      await tx.auditLog.create({
        data: {
          action: "PROTOCOL_CREATED",
          userId: createdById,
          secretariatId: input.originSecretariatId,
          entityType: "Protocol",
          entityId: protocol.id,
          metadata: { number },
          ip: "server",
          userAgent: "server-action",
        },
      })

      return protocol
    })
  }

  /**
   * Forward a protocol to a new secretariat/sector.
   */
  static async forward(
    protocolId: string,
    input: {
      description: string
      notes?: string
      toSecretariatId: string
      toOrganId?: string
      toSectorId?: string
      ccDestinations?: Array<{ toSecretariatId: string; toSectorId?: string }>
    },
    performedById: string
  ) {
    return prisma.$transaction(async (tx) => {
      const protocol = await tx.protocol.findUniqueOrThrow({
        where: { id: protocolId },
        select: {
          currentSecretariatId: true,
          currentOrganId: true,
          currentSectorId: true,
        },
      })

      const isInterSecretariat =
        protocol.currentSecretariatId !== input.toSecretariatId

      // Update current location
      const updated = await tx.protocol.update({
        where: { id: protocolId },
        data: {
          status: "IN_PROGRESS",
          currentSecretariatId: input.toSecretariatId,
          currentOrganId: input.toOrganId || null,
          currentSectorId: input.toSectorId || null,
        },
      })

      // Record forwarding movement
      await tx.movement.create({
        data: {
          protocolId,
          type: "FORWARDING",
          description: input.description,
          notes: input.notes || null,
          fromSecretariatId: protocol.currentSecretariatId,
          fromOrganId: protocol.currentOrganId,
          fromSectorId: protocol.currentSectorId,
          toSecretariatId: input.toSecretariatId,
          toOrganId: input.toOrganId || null,
          toSectorId: input.toSectorId || null,
          isInterSecretariat,
          performedById,
        },
      })

      // CC forwarding movements (don't change current location)
      if (input.ccDestinations?.length) {
        for (const cc of input.ccDestinations) {
          if (!cc.toSecretariatId) continue
          await tx.movement.create({
            data: {
              protocolId,
              type: "FORWARDING",
              description: `[CÓPIA] ${input.description}`,
              notes: input.notes || null,
              fromSecretariatId: protocol.currentSecretariatId,
              fromSectorId: protocol.currentSectorId,
              toSecretariatId: cc.toSecretariatId,
              toSectorId: cc.toSectorId || null,
              isInterSecretariat: protocol.currentSecretariatId !== cc.toSecretariatId,
              performedById,
            },
          })
        }
      }

      await tx.auditLog.create({
        data: {
          action: "PROTOCOL_FORWARDED",
          userId: performedById,
          entityType: "Protocol",
          entityId: protocolId,
          metadata: {
            from: protocol.currentSecretariatId,
            to: input.toSecretariatId,
            isInterSecretariat,
            ccCount: input.ccDestinations?.length ?? 0,
          },
          ip: "server",
          userAgent: "server-action",
        },
      })

      return updated
    })
  }
}
