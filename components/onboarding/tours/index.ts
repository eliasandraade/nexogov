import type { UserRole } from "@prisma/client"
import type { DriveStep } from "driver.js"
import { adminTourSteps } from "./admin"
import { gestorTourSteps } from "./gestor"
import { servidorTourSteps } from "./servidor"
import { dashboardGestorSteps } from "./dashboard-gestor"
import { dashboardPrefeitoSteps } from "./dashboard-prefeito"
import { protocolsListSteps } from "./protocols-list"
import { protocolsDetailSteps } from "./protocols-detail"

const ADMIN_ROLES: UserRole[] = ["ADMIN_SISTEMA", "DEV", "ADMIN"]
const SECRETARIAT_MANAGER_ROLES: UserRole[] = ["GESTOR", "SECRETARIO"]
const EXECUTIVE_ROLES: UserRole[] = ["PREFEITO", "VICE_PREFEITO"]

/**
 * Returns the localStorage key for the tour triggered by this role + pathname combination.
 * Page-specific tours use their own key. Navigation tours (shown on any other page)
 * always use "onboarding:navigation" so they are only shown once regardless of which
 * non-special page triggered them.
 */
export function getTourKey(role: UserRole, pathname: string): string {
  if (
    pathname === "/dashboard" &&
    (SECRETARIAT_MANAGER_ROLES.includes(role) || EXECUTIVE_ROLES.includes(role))
  ) {
    return "onboarding:dashboard"
  }
  if (pathname === "/protocols") return "onboarding:protocols"
  if (pathname.startsWith("/protocols/") && pathname !== "/protocols/novo") {
    return "onboarding:protocol-detail"
  }
  return "onboarding:navigation"
}

export function getTourSteps(role: UserRole, pathname?: string): DriveStep[] {
  if (pathname === "/dashboard") {
    if (SECRETARIAT_MANAGER_ROLES.includes(role)) return dashboardGestorSteps
    if (EXECUTIVE_ROLES.includes(role)) return dashboardPrefeitoSteps
  }
  if (pathname === "/protocols") return protocolsListSteps
  if (pathname?.startsWith("/protocols/") && pathname !== "/protocols/novo") {
    return protocolsDetailSteps
  }
  if (ADMIN_ROLES.includes(role)) return adminTourSteps
  if ([...SECRETARIAT_MANAGER_ROLES, ...EXECUTIVE_ROLES].includes(role)) return gestorTourSteps
  return servidorTourSteps
}
