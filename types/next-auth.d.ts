import { UserRole } from "@prisma/client"
import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    role: UserRole
    secretariatId: string | null
    secretariat: { id: string; name: string; code: string } | null
    organId: string | null
    organ: { id: string; name: string; code: string } | null
    sectorId: string | null
    sector: { id: string; name: string; code: string } | null
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      secretariatId: string | null
      secretariat: { id: string; name: string; code: string } | null
      organId: string | null
      organ: { id: string; name: string; code: string } | null
      sectorId: string | null
      sector: { id: string; name: string; code: string } | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    secretariatId: string | null
    secretariat: { id: string; name: string; code: string } | null
    organId: string | null
    organ: { id: string; name: string; code: string } | null
    sectorId: string | null
    sector: { id: string; name: string; code: string } | null
  }
}
