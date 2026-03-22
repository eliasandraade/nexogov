export type { UserRole, ProtocolStatus, ProtocolPriority, ProtocolType, MovementType } from "@prisma/client"

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ProtocolListItem {
  id: string
  number: string
  title: string
  type: string
  status: string
  priority: string
  requesterName: string | null
  currentSecretariat: { name: string; code: string }
  currentSector: { name: string; code: string } | null
  createdBy: { name: string }
  createdAt: Date
  updatedAt: Date
  _count: { documents: number; movements: number }
}

export interface ProtocolFilters {
  search?: string
  status?: string
  type?: string
  priority?: string
  secretariatId?: string
  sectorId?: string
  from?: string
  to?: string
  page?: number
  pageSize?: number
}

export interface MovementWithRelations {
  id: string
  type: string
  description: string
  notes: string | null
  isInterSecretariat: boolean
  fromSecretariat: { name: string; code: string } | null
  fromSector: { name: string; code: string } | null
  toSecretariat: { name: string; code: string } | null
  toSector: { name: string; code: string } | null
  performedBy: { name: string }
  createdAt: Date
}

export interface DocumentWithMeta {
  id: string
  originalName: string
  mimeType: string
  sizeBytes: number
  visibility: string
  description: string | null
  uploadedBy: { name: string }
  createdAt: Date
}
