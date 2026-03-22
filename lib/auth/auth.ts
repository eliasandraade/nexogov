import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { loginValidator } from "@/validators/login.validator"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginValidator.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: {
            secretariat: { select: { id: true, name: true, code: true } },
            organ: { select: { id: true, name: true, code: true } },
            sector: { select: { id: true, name: true, code: true } },
          },
        })

        if (!user || !user.active) return null

        const passwordValid = await bcrypt.compare(parsed.data.password, user.passwordHash)
        if (!passwordValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          secretariatId: user.secretariatId,
          secretariat: user.secretariat,
          organId: user.organId,
          organ: user.organ,
          sectorId: user.sectorId,
          sector: user.sector,
        }
      },
    }),
  ],
})
