import { z } from "zod"

export const createProtocolValidator = z.object({
  title: z.string().min(5, "Título deve ter no mínimo 5 caracteres").max(200),
  description: z.string().min(10, "Descrição deve ter no mínimo 10 caracteres"),
  type: z.enum([
    "ADMINISTRATIVE",
    "FINANCIAL",
    "LEGAL",
    "TECHNICAL",
    "HUMAN_RESOURCES",
    "SOCIAL",
    "ENVIRONMENTAL",
    "OTHER",
  ]),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  requesterName: z.string().max(200).optional().or(z.literal("")),
  requesterDocument: z.string().max(20).optional().or(z.literal("")),
  requesters: z.array(z.object({
    name: z.string().min(1).max(200),
    document: z.string().max(30).optional().or(z.literal("")),
    company: z.string().max(200).optional().or(z.literal("")),
  })).optional().default([]),
  internalNotes: z.string().max(2000).optional().or(z.literal("")),
  password: z
    .string()
    .min(4, "Senha do protocolo deve ter no mínimo 4 caracteres")
    .max(50),
  originSecretariatId: z.string().cuid("Secretaria de origem inválida"),
  originOrganId: z.string().cuid().optional().or(z.literal("")),
  originSectorId: z.string().cuid().optional().or(z.literal("")),
  currentSecretariatId: z.string().cuid("Secretaria atual inválida"),
  currentOrganId: z.string().cuid().optional().or(z.literal("")),
  currentSectorId: z.string().cuid().optional().or(z.literal("")),
  deadlineAt: z.string().datetime().optional().or(z.literal("")),
})

export type CreateProtocolInput = z.infer<typeof createProtocolValidator>

export const updateProtocolStatusValidator = z.object({
  protocolId: z.string().cuid(),
  status: z.enum(["OPEN", "IN_PROGRESS", "PENDING", "DEFERRED", "ARCHIVED", "CLOSED"]),
  notes: z.string().max(1000).optional(),
})

export type UpdateProtocolStatusInput = z.infer<typeof updateProtocolStatusValidator>

export const forwardProtocolValidator = z.object({
  protocolId: z.string().cuid(),
  description: z.string().min(5, "Descreva a movimentação").max(2000),
  notes: z.string().max(2000).optional(),
  toSecretariatId: z.string().cuid("Secretaria de destino inválida"),
  toOrganId: z.string().cuid().optional().or(z.literal("")),
  toSectorId: z.string().cuid().optional().or(z.literal("")),
  ccDestinations: z.array(z.object({
    toSecretariatId: z.string().cuid(),
    toSectorId: z.string().cuid().optional().or(z.literal("")),
  })).optional().default([]),
  deadlineAt: z.string().datetime().optional().or(z.literal("")),
})

export type ForwardProtocolInput = z.infer<typeof forwardProtocolValidator>

export const protocolFiltersValidator = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  priority: z.string().optional(),
  secretariatId: z.string().optional(),
  sectorId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(20),
})

export type ProtocolFiltersInput = z.infer<typeof protocolFiltersValidator>
