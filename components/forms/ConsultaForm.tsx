"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtocolTimeline } from "@/components/timeline/ProtocolTimeline"
import { formatDate } from "@/lib/utils/format"
import {
  PROTOCOL_STATUS_LABELS,
  PROTOCOL_STATUS_VARIANTS,
  PROTOCOL_TYPE_LABELS,
} from "@/lib/utils/labels"
import { Loader2, Search, MapPin } from "lucide-react"

interface PublicProtocol {
  number: string
  title: string
  type: string
  status: string
  createdAt: string
  currentSecretariat: { name: string; code: string }
  currentSector: { name: string } | null
  movements: Array<{
    id: string
    type: string
    description: string
    notes: string | null
    isInterSecretariat: boolean
    fromSecretariat: { name: string; code: string } | null
    fromSector: { name: string } | null
    toSecretariat: { name: string; code: string } | null
    toSector: { name: string } | null
    performedBy: { name: string }
    createdAt: string
  }>
}

export function ConsultaForm() {
  const [number, setNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [protocol, setProtocol] = useState<PublicProtocol | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setProtocol(null)

    const cleaned = number.trim().toUpperCase()
    if (!/^\d{4}\.\d{6}$/.test(cleaned)) {
      setError("Formato inválido. Use o formato: 2026.000001")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/public/protocols/${encodeURIComponent(cleaned)}`)
      if (res.status === 404) {
        setError("Protocolo não encontrado. Verifique o número informado.")
        return
      }
      if (!res.ok) {
        setError("Erro ao consultar protocolo. Tente novamente.")
        return
      }
      const data = await res.json()
      setProtocol(data)
    } catch {
      setError("Erro de conexão. Verifique sua internet e tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search box */}
      <Card className="max-w-xl mx-auto">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="protocol-number">Número do Protocolo</Label>
              <div className="flex gap-2">
                <Input
                  id="protocol-number"
                  placeholder="Ex: 2026.000001"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="font-mono"
                  disabled={loading}
                />
                <Button type="submit" disabled={loading || !number.trim()}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Result */}
      {protocol && (
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Summary */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-lg font-bold text-primary">
                    {protocol.number}
                  </span>
                  <h2 className="text-base font-semibold mt-1">{protocol.title}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={
                      PROTOCOL_STATUS_VARIANTS[
                        protocol.status as keyof typeof PROTOCOL_STATUS_VARIANTS
                      ] ?? "outline"
                    }
                  >
                    {PROTOCOL_STATUS_LABELS[protocol.status as keyof typeof PROTOCOL_STATUS_LABELS]}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {PROTOCOL_TYPE_LABELS[protocol.type as keyof typeof PROTOCOL_TYPE_LABELS]}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Localização Atual
                  </p>
                  <p className="font-medium mt-1">
                    {protocol.currentSecretariat.name}
                  </p>
                  {protocol.currentSector && (
                    <p className="text-muted-foreground text-xs">
                      {protocol.currentSector.name}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    Data de Abertura
                  </p>
                  <p className="font-medium mt-1">
                    {formatDate(new Date(protocol.createdAt))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Histórico de Movimentações ({protocol.movements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProtocolTimeline
                movements={protocol.movements.map((m) => ({
                  ...m,
                  createdAt: new Date(m.createdAt),
                }))}
              />
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            Para acessar documentos vinculados a este protocolo,{" "}
            <a href="/consulta/documentos" className="underline text-primary">
              clique aqui
            </a>{" "}
            e informe também a senha do protocolo.
          </p>
        </div>
      )}
    </div>
  )
}
