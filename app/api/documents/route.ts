import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { DocumentService } from "@/services/document.service"
import { prisma } from "@/lib/prisma"
import { canCreateProtocol, isSecretariatScoped } from "@/lib/permissions"
import { documentUploadValidator } from "@/validators/document.validator"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  if (!canCreateProtocol(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "Arquivo é obrigatório." }, { status: 400 })
    }

    const parsed = documentUploadValidator.safeParse({
      protocolId: formData.get("protocolId"),
      visibility: formData.get("visibility") ?? undefined,
      category: formData.get("category") ?? undefined,
      description: formData.get("description") ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { protocolId, visibility, category, description } = parsed.data

    if (isSecretariatScoped(session.user.role) && session.user.secretariatId) {
      const sid = session.user.secretariatId
      const protocol = await prisma.protocol.findUnique({
        where: { id: protocolId },
        select: {
          originSecretariatId: true,
          currentSecretariatId: true,
          movements: {
            select: { fromSecretariatId: true, toSecretariatId: true },
          },
        },
      })

      if (!protocol) {
        return NextResponse.json({ error: "Protocolo não encontrado." }, { status: 404 })
      }

      const involved =
        protocol.originSecretariatId === sid ||
        protocol.currentSecretariatId === sid ||
        protocol.movements.some(
          (m) => m.fromSecretariatId === sid || m.toSecretariatId === sid
        )

      if (!involved) {
        return NextResponse.json({ error: "Não autorizado para este protocolo." }, { status: 403 })
      }
    }

    const document = await DocumentService.upload(protocolId, file, {
      description,
      visibility,
      category,
      uploadedById: session.user.id,
    })

    return NextResponse.json({ id: document.id, url: document.url }, { status: 201 })
  } catch (error: any) {
    console.error("[POST /api/documents]", error)
    return NextResponse.json({ error: error.message ?? "Erro ao fazer upload." }, { status: 500 })
  }
}
