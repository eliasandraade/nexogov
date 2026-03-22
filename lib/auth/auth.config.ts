import type { NextAuthConfig } from "next-auth"

/**
 * Edge-compatible auth config — no Node.js-only dependencies.
 * Used in middleware for JWT verification.
 * Full config (with PrismaAdapter + Credentials) lives in auth.ts.
 */
export const authConfig = {
  providers: [],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
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
    session({ session, token }) {
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
} satisfies NextAuthConfig
