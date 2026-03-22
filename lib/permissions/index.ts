import { UserRole } from "@prisma/client"

// Tier sets — include both new and legacy role names for safety
const ADMIN_ROLES = new Set<UserRole>(["ADMIN_SISTEMA", "DEV", "ADMIN"])
const MANAGER_ROLES = new Set<UserRole>([
  ...ADMIN_ROLES,
  "GESTOR",
  "PREFEITO",
  "VICE_PREFEITO",
  "SECRETARIO",
])
const CREATOR_ROLES = new Set<UserRole>([
  ...MANAGER_ROLES,
  "SERVIDOR_PUBLICO",
  "PROTOCOLO",
])
// CONSELHEIRO / OPERADOR_SETOR can view but not create

export function canCreateProtocol(role: UserRole): boolean {
  return CREATOR_ROLES.has(role)
}

export function canForwardProtocol(role: UserRole): boolean {
  return CREATOR_ROLES.has(role)
}

export function canManageUsers(role: UserRole): boolean {
  return ADMIN_ROLES.has(role)
}

export function canManageOrganizationalStructure(role: UserRole): boolean {
  return ADMIN_ROLES.has(role)
}

export function canViewAuditLogs(role: UserRole): boolean {
  return MANAGER_ROLES.has(role)
}

export function canViewDashboard(role: UserRole): boolean {
  return MANAGER_ROLES.has(role)
}

export function canViewInternalDocuments(role: UserRole): boolean {
  return true // all authenticated users
}

/** Returns true if the user has at least the level of the given anchor role. */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  if (ADMIN_ROLES.has(requiredRole)) return ADMIN_ROLES.has(userRole)
  if (MANAGER_ROLES.has(requiredRole)) return MANAGER_ROLES.has(userRole)
  if (CREATOR_ROLES.has(requiredRole)) return CREATOR_ROLES.has(userRole)
  return true
}
