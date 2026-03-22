import { z } from "zod"

export const documentAccessValidator = z.object({
  protocolNumber: z
    .string()
    .regex(/^\d{4}\.\d{6}$/, "Número de protocolo inválido (formato: AAAA.NNNNNN)"),
  protocolPassword: z.string().min(4, "Senha inválida"),
})

export type DocumentAccessInput = z.infer<typeof documentAccessValidator>

export const publicProtocolLookupValidator = z.object({
  number: z
    .string()
    .regex(/^\d{4}\.\d{6}$/, "Número de protocolo inválido (formato: AAAA.NNNNNN)"),
})

export type PublicProtocolLookupInput = z.infer<typeof publicProtocolLookupValidator>
