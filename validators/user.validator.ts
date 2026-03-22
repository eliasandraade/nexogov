import { z } from "zod"
import { UserRole } from "@prisma/client"

export const createUserValidator = z.object({
  name: z.string().min(3).max(200),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  role: z.nativeEnum(UserRole),
  secretariatId: z.string().cuid().optional().or(z.literal("")),
  organId: z.string().cuid().optional().or(z.literal("")),
  sectorId: z.string().cuid().optional().or(z.literal("")),
})

export type CreateUserInput = z.infer<typeof createUserValidator>

export const updateUserValidator = z.object({
  name: z.string().min(3).max(200).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).max(100).optional().or(z.literal("")),
  role: z.nativeEnum(UserRole).optional(),
  active: z.boolean().optional(),
  secretariatId: z.string().cuid().optional().or(z.literal("")),
  organId: z.string().cuid().optional().or(z.literal("")),
  sectorId: z.string().cuid().optional().or(z.literal("")),
})

export type UpdateUserInput = z.infer<typeof updateUserValidator>
