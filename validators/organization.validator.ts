import { z } from "zod"

export const createSecretariatValidator = z.object({
  name: z.string().min(3).max(200),
  code: z
    .string()
    .min(2)
    .max(20)
    .regex(/^[A-Z0-9_]+$/, "Código deve conter apenas letras maiúsculas, números e _"),
  description: z.string().max(500).optional(),
})

export type CreateSecretariatInput = z.infer<typeof createSecretariatValidator>

export const createOrganValidator = z.object({
  name: z.string().min(3).max(200),
  code: z
    .string()
    .min(2)
    .max(20)
    .regex(/^[A-Z0-9_]+$/, "Código deve conter apenas letras maiúsculas, números e _"),
  description: z.string().max(500).optional(),
  secretariatId: z.string().cuid(),
})

export type CreateOrganInput = z.infer<typeof createOrganValidator>

export const createSectorValidator = z.object({
  name: z.string().min(3).max(200),
  code: z
    .string()
    .min(2)
    .max(20)
    .regex(/^[A-Z0-9_]+$/, "Código deve conter apenas letras maiúsculas, números e _"),
  description: z.string().max(500).optional(),
  secretariatId: z.string().cuid(),
  organId: z.string().cuid().optional().or(z.literal("")),
})

export type CreateSectorInput = z.infer<typeof createSectorValidator>
