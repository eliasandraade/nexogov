import { z } from "zod"

export const documentUploadValidator = z.object({
  protocolId: z.string().cuid("ID de protocolo inválido"),
  visibility: z.enum(["INTERNAL", "RESTRICTED_BY_PROTOCOL_PASSWORD"]).default("RESTRICTED_BY_PROTOCOL_PASSWORD"),
  category: z.enum([
    "REQUERIMENTO", "OFICIO", "LAUDO", "CERTIDAO", "CONTRATO",
    "ATA", "DESPACHO", "RELATORIO", "DECLARACAO", "OUTRO",
  ]).optional(),
  description: z.string().max(500).optional(),
})

export type DocumentUploadInput = z.infer<typeof documentUploadValidator>

export const documentAccessValidator = z.object({
  protocolNumber: z
    .string()
    .regex(/^\d{4}\.\d{6}$/, "Número de protocolo inválido (formato: AAAA.NNNNNN)"),
  protocolPassword: z.string().min(4, "Senha inválida").max(100, "Senha inválida"),
})

export type DocumentAccessInput = z.infer<typeof documentAccessValidator>

export const publicProtocolLookupValidator = z.object({
  number: z
    .string()
    .regex(/^\d{4}\.\d{6}$/, "Número de protocolo inválido (formato: AAAA.NNNNNN)"),
})

export type PublicProtocolLookupInput = z.infer<typeof publicProtocolLookupValidator>
