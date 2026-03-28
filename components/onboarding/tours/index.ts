import type { UserRole } from "@prisma/client"
import type { DriveStep } from "driver.js"
import { adminTourSteps } from "./admin"
import { gestorTourSteps } from "./gestor"
import { servidorTourSteps } from "./servidor"
import { dashboardGestorSteps } from "./dashboard-gestor"
import { dashboardPrefeitoSteps } from "./dashboard-prefeito"

const ADMIN_ROLES: UserRole[] = ["ADMIN_SISTEMA", "DEV", "ADMIN"]
const SECRETARIAT_MANAGER_ROLES: UserRole[] = ["GESTOR", "SECRETARIO"]
const EXECUTIVE_ROLES: UserRole[] = ["PREFEITO", "VICE_PREFEITO"]

export function getTourSteps(role: UserRole, pathname?: string): DriveStep[] {
  // Dashboard-specific tours for managers — triggered when on /dashboard
  if (pathname === "/dashboard") {
    if (SECRETARIAT_MANAGER_ROLES.includes(role)) return dashboardGestorSteps
    if (EXECUTIVE_ROLES.includes(role)) return dashboardPrefeitoSteps
  }

  // Default navigation tours
  if (ADMIN_ROLES.includes(role)) return adminTourSteps
  if ([...SECRETARIAT_MANAGER_ROLES, ...EXECUTIVE_ROLES].includes(role)) return gestorTourSteps
  return servidorTourSteps
}
