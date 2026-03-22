import { prisma } from "@/lib/prisma"
import { uploadDocument, deleteDocument } from "@/lib/storage/cloudinary"
import { logAudit, logDocumentAccess } from "@/lib/audit/log"

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]

export class DocumentService {
  static async upload(
    protocolId: string,
    file: File,
    options: {
      description?: string
      visibility?: "INTERNAL" | "RESTRICTED_BY_PROTOCOL_PASSWORD"
      uploadedById: string
    }
  ) {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("Arquivo muito grande. Limite: 20 MB.")
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error("Tipo de arquivo não permitido.")
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const { publicId, url, storedName, fileHash } = await uploadDocument(buffer, {
      protocolId,
      originalName: file.name,
      mimeType: file.type,
    })

    const document = await prisma.$transaction(async (tx) => {
      const doc = await tx.document.create({
        data: {
          protocolId,
          originalName: file.name,
          storedName,
          storageKey: publicId,
          url,
          mimeType: file.type,
          sizeBytes: file.size,
          fileHash,
          description: options.description || null,
          visibility: options.visibility ?? "RESTRICTED_BY_PROTOCOL_PASSWORD",
          uploadedById: options.uploadedById,
        },
      })

      await tx.movement.create({
        data: {
          protocolId,
          type: "DOCUMENT_ATTACHMENT",
          description: `Documento "${file.name}" juntado ao protocolo.`,
          performedById: options.uploadedById,
        },
      })

      await tx.auditLog.create({
        data: {
          action: "DOCUMENT_ATTACHED",
          userId: options.uploadedById,
          entityType: "Document",
          entityId: doc.id,
          metadata: { fileName: file.name, protocolId } as any,
          ip: "server",
          userAgent: "server-action",
        },
      })

      return doc
    })

    return document
  }

  static async delete(documentId: string, userId: string) {
    const doc = await prisma.document.findUniqueOrThrow({
      where: { id: documentId },
    })

    await deleteDocument(doc.storageKey)
    await prisma.document.delete({ where: { id: documentId } })

    await logAudit({
      action: "DOCUMENT_ATTACHED", // reusing closest action — could add DOCUMENT_DELETED
      userId,
      entityType: "Document",
      entityId: documentId,
      metadata: { deleted: true, fileName: doc.originalName },
    })
  }

  /**
   * Validates protocol password and returns documents if correct.
   * Always logs the access attempt.
   */
  static async getDocumentsWithPasswordAuth(
    protocolNumber: string,
    plainPassword: string,
    accessMeta: { ip: string; userAgent: string; routeReference?: string }
  ) {
    const bcrypt = await import("bcryptjs")

    const protocol = await prisma.protocol.findUnique({
      where: { number: protocolNumber },
      select: {
        id: true,
        passwordHash: true,
        documents: {
          where: { visibility: "RESTRICTED_BY_PROTOCOL_PASSWORD" },
          select: {
            id: true,
            originalName: true,
            mimeType: true,
            sizeBytes: true,
            description: true,
            url: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!protocol) return { success: false, error: "Protocolo não encontrado." }

    const passwordValid = await bcrypt.compare(plainPassword, protocol.passwordHash)

    if (!passwordValid) {
      // Log invalid attempt for all documents of the protocol (or just the protocol level)
      await prisma.documentAccessLog.create({
        data: {
          documentId: protocol.documents[0]?.id ?? "unknown",
          protocolId: protocol.id,
          accessType: "INVALID_ATTEMPT",
          accessOrigin: "EXTERNAL_INVALID_ATTEMPT",
          routeReference: accessMeta.routeReference ?? "/consulta/documentos",
          ip: accessMeta.ip,
          userAgent: accessMeta.userAgent,
          success: false,
          failReason: "Senha incorreta",
        },
      }).catch(() => {}) // audit failure must not crash

      return { success: false, error: "Senha incorreta." }
    }

    // Log successful access for each document
    await Promise.all(
      protocol.documents.map((doc) =>
        prisma.documentAccessLog
          .create({
            data: {
              documentId: doc.id,
              protocolId: protocol.id,
              accessType: "VIEW",
              accessOrigin: "EXTERNAL_NUMBER_PASSWORD",
              routeReference: accessMeta.routeReference ?? "/consulta/documentos",
              ip: accessMeta.ip,
              userAgent: accessMeta.userAgent,
              success: true,
            },
          })
          .catch(() => {})
      )
    )

    return { success: true, documents: protocol.documents }
  }
}
