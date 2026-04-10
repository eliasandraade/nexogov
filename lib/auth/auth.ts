import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { loginValidator } from "@/validators/login.validator"
import { authConfig } from "./auth.config"
import { rateLimit } from "@/lib/rate-limit"
import { logAudit } from "@/lib/audit/log"

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
      async authorize(credentials, request) {
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          request.headers.get("x-real-ip") ??
          "unknown"
        const limited = rateLimit(`login:${ip}`, { maxRequests: 10, windowSeconds: 60 })
        if (!limited.allowed) return null

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
  events: {
    async signIn({ user }) {
      if (user.id) {
        await logAudit({
          action: "LOGIN",
          userId: user.id,
          entityType: "User",
          entityId: user.id,
        })
      }
    },
    async signOut(message) {
      const token = "token" in message ? message.token : null
      if (token?.sub) {
        await logAudit({
          action: "LOGOUT",
          userId: token.sub,
          entityType: "User",
          entityId: token.sub,
        })
      }
    },
  },
})
