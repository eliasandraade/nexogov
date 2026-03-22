"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileText } from "lucide-react"
import { PROTOCOL_STATUS_LABELS } from "@/lib/utils/labels"
import type { ProtocolStatus } from "@prisma/client"

interface Secretariat { id: string; name: string; code: string }

export function ReportsClient({ secretariats }: { secretariats: Secretariat[] }) {
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [secretariatId, setSecretariatId] = useState("")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  function buildUrl(format: string) {
    const params = new URLSearchParams()
    if (from) params.set("from", from)
    if (to) params.set("to", to)
    if (secretariatId) params.set("secretariatId", secretariatId)
    if (status) params.set("status", status)
    params.set("format", format)
    return `/api/reports?${params.toString()}`
  }

  async function handleExport() {
    setLoading(true)
    const url = buildUrl("csv")
    const res = await fetch(url)
    const blob = await res.blob()
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `nexogov-relatorio-${Date.now()}.csv`
    a.click()
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
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
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Data final</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Secretaria</Label>
              <Select value={secretariatId} onValueChange={(v) => setSecretariatId(v === "all" ? "" : v)}>
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
              <Select value={status} onValueChange={(v) => setStatus(v === "all" ? "" : v)}>
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

          <div className="flex gap-3 pt-2">
            <Button onClick={handleExport} disabled={loading} className="gap-2">
              <Download className="h-4 w-4" />
              {loading ? "Gerando..." : "Exportar CSV"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sobre os relatórios</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>O CSV exportado contém: número, título, tipo, status, prioridade, secretaria de origem, secretaria atual, setor atual, datas de criação/encerramento/prazo, quantidade de movimentações e documentos.</p>
          <p>Use filtros combinados para gerar recortes específicos. O arquivo pode ser aberto no Excel ou Google Sheets.</p>
        </CardContent>
      </Card>
    </div>
  )
}
