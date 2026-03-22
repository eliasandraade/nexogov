import { UserRole } from "@prisma/client"

/**
 * Role hierarchy for permission checks.
 * Higher index = more permissions.
 */
const ROLE_HIERARCHY: UserRole[] = [
  "OPERADOR_SETOR",
  "PROTOCOLO",
  "GESTOR",
  "ADMIN",
]

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(requiredRole)
}

export function canCreateProtocol(role: UserRole): boolean {
  return hasRole(role, "PROTOCOLO")
}

export function canForwardProtocol(role: UserRole): boolean {
  return hasRole(role, "PROTOCOLO")
}

export function canManageUsers(role: UserRole): boolean {
  return hasRole(role, "ADMIN")
}

export function canManageOrganizationalStructure(role: UserRole): boolean {
  return hasRole(role, "ADMIN")
}

export function canViewAuditLogs(role: UserRole): boolean {
  return hasRole(role, "GESTOR")
}

export function canViewDashboard(role: UserRole): boolean {
  return hasRole(role, "GESTOR")
}

export function canViewInternalDocuments(role: UserRole): boolean {
  return hasRole(role, "OPERADOR_SETOR")
}
