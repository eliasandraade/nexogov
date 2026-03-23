import { z } from "zod"
import { UserRole } from "@prisma/client"

const strongPassword = z
  .string()
  .min(8, "Senha deve ter no mínimo 8 caracteres")
  .max(100)
  .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
  .regex(/[0-9]/, "Deve conter ao menos um número")
  .regex(/[^A-Za-z0-9]/, "Deve conter ao menos um caractere especial")

export const createUserValidator = z.object({
  name: z.string().min(3).max(200),
  email: z.string().email(),
  password: strongPassword,
  role: z.nativeEnum(UserRole),
  secretariatId: z.string().cuid().optional().or(z.literal("")),
  organId: z.string().cuid().optional().or(z.literal("")),
  sectorId: z.string().cuid().optional().or(z.literal("")),
})

export type CreateUserInput = z.infer<typeof createUserValidator>

export const updateUserValidator = z.object({
  name: z.string().min(3).max(200).optional(),
  email: z.string().email().optional(),
  password: strongPassword.optional().or(z.literal("")),
  role: z.nativeEnum(UserRole).optional(),
  active: z.boolean().optional(),
  secretariatId: z.string().cuid().optional().or(z.literal("")),
  organId: z.string().cuid().optional().or(z.literal("")),
  sectorId: z.string().cuid().optional().or(z.literal("")),
})

export type UpdateUserInput = z.infer<typeof updateUserValidator>
