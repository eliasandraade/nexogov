import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { DocumentService } from "@/services/document.service"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const protocolId = formData.get("protocolId") as string | null
    const description = formData.get("description") as string | null
    const visibility = (formData.get("visibility") as string | null) ?? "RESTRICTED_BY_PROTOCOL_PASSWORD"
    const category = formData.get("category") as string | null

    if (!file || !protocolId) {
      return NextResponse.json({ error: "Arquivo e protocolo são obrigatórios." }, { status: 400 })
    }

    const document = await DocumentService.upload(protocolId, file, {
      description: description ?? undefined,
      visibility: visibility as "INTERNAL" | "RESTRICTED_BY_PROTOCOL_PASSWORD",
      category: category ?? undefined,
      uploadedById: session.user.id,
    })

    return NextResponse.json({ id: document.id, url: document.url }, { status: 201 })
  } catch (error: any) {
    console.error("[POST /api/documents]", error)
    return NextResponse.json({ error: error.message ?? "Erro ao fazer upload." }, { status: 500 })
  }
}
