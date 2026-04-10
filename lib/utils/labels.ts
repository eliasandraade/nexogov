export const PROTOCOL_STATUS_LABELS: Record<string, string> = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em Análise",
  PENDING: "Pendente",
  DEFERRED: "Deferido",
  REJECTED: "Indeferido",
  ARCHIVED: "Arquivado",
  CLOSED: "Encerrado",
}

export const PROTOCOL_STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info"> = {
  OPEN: "info",
  IN_PROGRESS: "warning",
  PENDING: "secondary",
  DEFERRED: "success",
  REJECTED: "destructive",
  ARCHIVED: "outline",
  CLOSED: "secondary",
}

export const DOCUMENT_CATEGORY_LABELS: Record<string, string> = {
  REQUERIMENTO: "Requerimento",
  OFICIO: "Ofício",
  LAUDO: "Laudo",
  CERTIDAO: "Certidão",
  CONTRATO: "Contrato",
  ATA: "Ata",
  DESPACHO: "Despacho",
  RELATORIO: "Relatório",
  DECLARACAO: "Declaração",
  OUTRO: "Outro",
}

export const PROTOCOL_TYPE_LABELS: Record<string, string> = {
  ADMINISTRATIVE: "Administrativo",
  FINANCIAL: "Financeiro",
  LEGAL: "Jurídico",
  TECHNICAL: "Técnico",
  HUMAN_RESOURCES: "Recursos Humanos",
  SOCIAL: "Social",
  ENVIRONMENTAL: "Ambiental",
  OTHER: "Outro",
}

export const PROTOCOL_PRIORITY_LABELS: Record<string, string> = {
  LOW: "Baixa",
  NORMAL: "Normal",
  HIGH: "Alta",
  URGENT: "Urgente",
}

export const PROTOCOL_PRIORITY_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline" | "warning"> = {
  LOW: "secondary",
  NORMAL: "outline",
  HIGH: "warning",
  URGENT: "destructive",
}

export const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  CREATION: "Criação",
  FORWARDING: "Encaminhamento",
  RECEIPT: "Recebimento",
  DISPATCH: "Despacho",
  ADMINISTRATIVE_OPINION: "Parecer Administrativo",
  DOCUMENT_ATTACHMENT: "Juntada de Documento",
  STATUS_UPDATE: "Atualização de Status",
  FINALIZATION: "Finalização",
}

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  LOGIN: "Login realizado",
  LOGOUT: "Logout realizado",
  PROTOCOL_CREATED: "Protocolo criado",
  PROTOCOL_UPDATED: "Protocolo atualizado",
  PROTOCOL_CLONED: "Protocolo clonado",
  PROTOCOL_STATUS_CHANGED: "Status alterado",
  PROTOCOL_FORWARDED: "Protocolo encaminhado",
  DOCUMENT_ATTACHED: "Documento juntado",
  DOCUMENT_VIEWED: "Documento visualizado",
  DOCUMENT_DOWNLOADED: "Documento baixado",
  DOCUMENT_ACCESS_DENIED: "Acesso negado a documento",
  USER_CREATED: "Usuário criado",
  USER_UPDATED: "Usuário atualizado",
  SECRETARIAT_CREATED: "Secretaria criada",
  ORGAN_CREATED: "Órgão criado",
  SECTOR_CREATED: "Setor criado",
  ERROR: "Erro do sistema",
}

export const USER_ROLE_LABELS: Record<string, string> = {
  ADMIN_SISTEMA: "Administrador do Sistema",
  DEV: "DEV",
  PREFEITO: "Prefeito",
  VICE_PREFEITO: "Vice-Prefeito",
  SECRETARIO: "Secretário",
  GESTOR: "Gestor",
  SERVIDOR_PUBLICO: "Servidor Público",
  CONSELHEIRO: "Conselheiro",
  // Legacy
  ADMIN: "Administrador",
  PROTOCOLO: "Protocolo",
  OPERADOR_SETOR: "Operador de Setor",
}
