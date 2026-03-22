import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { loginValidator } from "@/validators/login.validator"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.secretariatId = (user as any).secretariatId
        token.secretariat = (user as any).secretariat
        token.organId = (user as any).organId
        token.organ = (user as any).organ
        token.sectorId = (user as any).sectorId
        token.sector = (user as any).sector
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as any
        session.user.secretariatId = token.secretariatId as string | null
        session.user.secretariat = token.secretariat as any
        session.user.organId = token.organId as string | null
        session.user.organ = token.organ as any
        session.user.sectorId = token.sectorId as string | null
        session.user.sector = token.sector as any
      }
      return session
    },
  },
})
