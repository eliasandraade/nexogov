import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

const strongPassword = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(100)
  .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
  .regex(/[0-9]/, "Deve conter ao menos um número")
  .regex(/[^A-Za-z0-9]/, "Deve conter ao menos um caractere especial")

const updateProfileValidator = z.object({
  name: z.string().min(3).max(200).optional(),
  currentPassword: z.string().optional(),
  newPassword: strongPassword.optional(),
})

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const body = await req.json()
  const parsed = updateProfileValidator.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { name, currentPassword, newPassword } = parsed.data
  const data: Record<string, unknown> = {}

  if (name) data.name = name

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Senha atual obrigatória" }, { status: 400 })
    }
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 })

    data.passwordHash = await bcrypt.hash(newPassword, 12)
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nenhuma alteração enviada" }, { status: 400 })
  }

  const user = await prisma.user.update({ where: { id: session.user.id }, data })
  return NextResponse.json({ id: user.id, name: user.name, email: user.email })
}
