"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
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
import { Loader2, Search, MapPin, Calendar, FileText } from "lucide-react"

interface PublicProtocol {
  number: string
  title: string
  type: string
  status: string
  createdAt: string
  deadlineAt: string | null
  currentSecretariat: { name: string; code: string }
  currentSector: { name: string } | null
  _count: { documents: number }
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
  const searchParams = useSearchParams()
  const [number, setNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [protocol, setProtocol] = useState<PublicProtocol | null>(null)

  async function doSearch(searchNumber: string) {
    const cleaned = searchNumber.trim().toUpperCase()
    if (!/^\d{4}\.\d{6}$/.test(cleaned)) {
      setError("Formato inválido. Use o formato: 2026.000001")
      return
    }
    setError(null)
    setProtocol(null)
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

  // Auto-search when arriving from login page with ?numero= param
  useEffect(() => {
    const numero = searchParams.get("numero")
    if (numero) {
      setNumber(numero)
      doSearch(numero)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    await doSearch(number)
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
        <div className="max-w-3xl mx-auto space-y-4 animate-slide-up">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
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
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Data de Abertura
                  </p>
                  <p className="font-medium mt-1">
                    {formatDate(new Date(protocol.createdAt))}
                  </p>
                  {protocol.deadlineAt && (
                    <p className={`text-xs mt-0.5 ${new Date(protocol.deadlineAt) < new Date() ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                      Prazo: {formatDate(new Date(protocol.deadlineAt))}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Documentos
                  </p>
                  <p className="font-medium mt-1">{protocol._count.documents}</p>
                  {protocol._count.documents > 0 && (
                    <a
                      href={`/consulta/documentos?numero=${encodeURIComponent(protocol.number)}`}
                      className="text-xs text-primary underline mt-0.5 block"
                    >
                      Acessar com senha →
                    </a>
                  )}
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

          {protocol._count.documents > 0 && (
            <p className="text-center text-xs text-muted-foreground">
              Para acessar os documentos,{" "}
              <a
                href={`/consulta/documentos?numero=${encodeURIComponent(protocol.number)}`}
                className="underline text-primary"
              >
                clique aqui
              </a>{" "}
              e informe a senha do protocolo.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
