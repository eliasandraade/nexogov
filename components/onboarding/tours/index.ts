import type { UserRole } from "@prisma/client"
import type { DriveStep } from "driver.js"
import { adminTourSteps } from "./admin"
import { gestorTourSteps } from "./gestor"
import { servidorTourSteps } from "./servidor"

const ADMIN_ROLES: UserRole[] = ["ADMIN_SISTEMA", "DEV", "ADMIN"]
const MANAGER_ROLES: UserRole[] = ["GESTOR", "PREFEITO", "VICE_PREFEITO", "SECRETARIO"]

export function getTourSteps(role: UserRole): DriveStep[] {
  if (ADMIN_ROLES.includes(role)) return adminTourSteps
  if (MANAGER_ROLES.includes(role)) return gestorTourSteps
  return servidorTourSteps
}
