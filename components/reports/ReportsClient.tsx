"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, BarChart3, Loader2 } from "lucide-react"
import { PROTOCOL_STATUS_LABELS, PROTOCOL_STATUS_VARIANTS } from "@/lib/utils/labels"
import type { ProtocolStatus } from "@prisma/client"

interface Secretariat { id: string; name: string; code: string }

interface ProtocolSummary {
  number: string
  title: string
  type: string
  status: string
  priority: string
  originSecretariat: { code: string }
  currentSecretariat: { code: string }
  createdAt: string
  closedAt: string | null
  deadlineAt: string | null
  _count: { movements: number; documents: number }
}

export function ReportsClient({ secretariats }: { secretariats: Secretariat[] }) {
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [secretariatId, setSecretariatId] = useState("")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [preview, setPreview] = useState<ProtocolSummary[] | null>(null)

  function buildUrl(format: string) {
    const params = new URLSearchParams()
    if (from) params.set("from", from)
    if (to) params.set("to", to)
    if (secretariatId) params.set("secretariatId", secretariatId)
    if (status) params.set("status", status)
    params.set("format", format)
    return `/api/reports?${params.toString()}`
  }

  async function handlePreview() {
    setPreviewing(true)
    const res = await fetch(buildUrl("json"))
    const data = await res.json()
    setPreview(Array.isArray(data) ? data : [])
    setPreviewing(false)
  }

  async function handleExport() {
    setLoading(true)
    const url = buildUrl("csv")
    const res = await fetch(url)
    const blob = await res.blob()
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `nexogov-protocolos-${Date.now()}.csv`
    a.click()
    setLoading(false)
  }

  async function handleExportAdvanced(entity: string) {
    const params = new URLSearchParams({ entity })
    if (from) params.set("from", from)
    if (to) params.set("to", to)
    const res = await fetch(`/api/export?${params.toString()}`)
    const blob = await res.blob()
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `nexogov-${entity}-${Date.now()}.csv`
    a.click()
  }

  // Summary stats from preview
  const stats = preview
    ? {
        total: preview.length,
        byStatus: preview.reduce<Record<string, number>>((acc, p) => {
          acc[p.status] = (acc[p.status] ?? 0) + 1
          return acc
        }, {}),
        avgMovements:
          preview.length > 0
            ? Math.round(preview.reduce((s, p) => s + p._count.movements, 0) / preview.length * 10) / 10
            : 0,
        overdue: preview.filter(
          (p) => p.deadlineAt && new Date(p.deadlineAt) < new Date() && p.status !== "CLOSED" && p.status !== "ARCHIVED"
        ).length,
      }
    : null

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Filtros do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Data inicial</Label>
              <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPreview(null) }} />
            </div>
            <div className="space-y-1">
              <Label>Data final</Label>
              <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPreview(null) }} />
            </div>
            <div className="space-y-1">
              <Label>Secretaria</Label>
              <Select value={secretariatId || "all"} onValueChange={(v) => { setSecretariatId(v === "all" ? "" : v); setPreview(null) }}>
                <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {secretariats.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={status || "all"} onValueChange={(v) => { setStatus(v === "all" ? "" : v); setPreview(null) }}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {(Object.keys(PROTOCOL_STATUS_LABELS) as ProtocolStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{PROTOCOL_STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button variant="outline" onClick={handlePreview} disabled={previewing}>
              {previewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
              Visualizar resumo
            </Button>
            <Button onClick={handleExport} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Exportar Protocolos (CSV)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview stats */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Resumo — {stats.total} protocolo{stats.total !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 rounded-md bg-muted/50">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total</p>
              </div>
              <div className="text-center p-3 rounded-md bg-muted/50">
                <p className="text-2xl font-bold">{stats.avgMovements}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Média de movimentações</p>
              </div>
              <div className="text-center p-3 rounded-md bg-muted/50">
                <p className={`text-2xl font-bold ${stats.overdue > 0 ? "text-destructive" : ""}`}>{stats.overdue}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Com prazo vencido</p>
              </div>
            </div>

            {Object.keys(stats.byStatus).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.byStatus).map(([s, count]) => (
                  <div key={s} className="flex items-center gap-1.5">
                    <Badge variant={PROTOCOL_STATUS_VARIANTS[s as ProtocolStatus] ?? "outline"} className="text-xs">
                      {PROTOCOL_STATUS_LABELS[s as ProtocolStatus]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Advanced exports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Exportações Avançadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Exportações completas para análise acadêmica e gestão. Aplicam os filtros de data quando disponíveis.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { entity: "protocols", label: "Todos os Protocolos", desc: "Metadados completos" },
              { entity: "movements", label: "Movimentações", desc: "Histórico completo" },
              { entity: "flows", label: "Fluxos Inter-Secretaria", desc: "Agregado por par" },
              { entity: "secretariats", label: "Secretarias", desc: "Contagens gerais" },
            ].map(({ entity, label, desc }) => (
              <button
                key={entity}
                onClick={() => handleExportAdvanced(entity)}
                className="flex flex-col items-start p-3 rounded-md border hover:bg-muted/50 transition-colors text-left"
              >
                <span className="text-sm font-medium flex items-center gap-2">
                  <Download className="h-3.5 w-3.5 text-muted-foreground" />
                  {label}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">{desc}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
