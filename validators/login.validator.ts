import { z } from "zod"

const passwordSchema = z
  .string()
  .min(8, "Senha deve ter no mínimo 8 caracteres")
  .regex(/[A-Z]/, "Senha deve conter ao menos uma letra maiúscula")
  .regex(/[0-9]/, "Senha deve conter ao menos um número")
  .regex(/[^A-Za-z0-9]/, "Senha deve conter ao menos um caractere especial")

export const loginValidator = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
})

/** Used when creating or changing user passwords */
export const passwordStrengthValidator = passwordSchema

export type LoginInput = z.infer<typeof loginValidator>
