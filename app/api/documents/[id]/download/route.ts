import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { logDocumentAccess } from "@/lib/audit/log"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const { id } = await params
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  const userAgent = req.headers.get("user-agent") ?? "unknown"

  const document = await prisma.document.findUnique({
    where: { id },
    select: {
      id: true,
      url: true,
      originalName: true,
      mimeType: true,
      protocolId: true,
      visibility: true,
    },
  })

  if (!document) {
    return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 })
  }

  await logDocumentAccess({
    documentId: document.id,
    protocolId: document.protocolId,
    userId: session.user.id,
    accessType: "DOWNLOAD",
    accessOrigin: "INTERNAL_AUTHENTICATED",
    routeReference: `/api/documents/${id}/download`,
    success: true,
  })

  // Redirect to Cloudinary URL — Cloudinary handles the actual delivery
  return NextResponse.redirect(document.url)
}
