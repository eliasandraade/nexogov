/**
 * Format a protocol number from year + sequence.
 * Example: formatProtocolNumber(2026, 1) => "2026.000001"
 */
export function formatProtocolNumber(year: number, sequence: number): string {
  return `${year}.${String(sequence).padStart(6, "0")}`
}

/**
 * Format file size in human-readable form.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

/**
 * Format a date to Brazilian locale string.
 */
export function formatDate(date: Date | string, withTime = false): string {
  const d = typeof date === "string" ? new Date(date) : date
  const options: Intl.DateTimeFormatOptions = withTime
    ? { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "2-digit", year: "numeric" }
  return d.toLocaleDateString("pt-BR", options)
}

/**
 * Format a relative time (e.g. "há 2 dias").
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return "agora mesmo"
  if (diffMin < 60) return `há ${diffMin} min`
  if (diffHours < 24) return `há ${diffHours}h`
  if (diffDays < 30) return `há ${diffDays} dia${diffDays > 1 ? "s" : ""}`
  return formatDate(d)
}
