"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { formatFileSize, formatDate } from "@/lib/utils/format"
import { Loader2, Lock, FileText, Download, Shield, Eye, EyeOff } from "lucide-react"

interface PublicDocument {
  id: string
  originalName: string
  mimeType: string
  sizeBytes: number
  description: string | null
  url: string
  createdAt: string
}

export function DocumentConsultaForm() {
  const [number, setNumber] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [documents, setDocuments] = useState<PublicDocument[] | null>(null)
  const [protocolNumberUsed, setProtocolNumberUsed] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setDocuments(null)

    const cleaned = number.trim()
    if (!/^\d{4}\.\d{6}$/.test(cleaned)) {
      setError("Formato inválido. Use o formato: 2026.000001")
      return
    }
    if (!password.trim()) {
      setError("Informe a senha do protocolo.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/public/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ protocolNumber: cleaned, protocolPassword: password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Acesso negado.")
        return
      }

      setDocuments(data.documents)
      setProtocolNumberUsed(cleaned)
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-lg mx-auto">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doc-number">Número do Protocolo</Label>
              <Input
                id="doc-number"
                placeholder="Ex: 2026.000001"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="font-mono"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-password">Senha do Protocolo</Label>
              <div className="relative">
                <Input
                  id="doc-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive flex items-center gap-2">
                <Lock className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || !number || !password}>
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Verificando...</>
              ) : (
                <><Lock className="h-4 w-4" />Acessar Documentos</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Audit notice */}
      <div className="max-w-lg mx-auto flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
        <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <p>
          Todo acesso a documentos é registrado com IP, data e horário para fins de
          rastreabilidade e auditoria institucional.
        </p>
      </div>

      {/* Documents result */}
      {documents !== null && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">
                Protocolo{" "}
                <span className="font-mono text-primary">{protocolNumberUsed}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {documents.length} documento{documents.length !== 1 ? "s" : ""} disponível{documents.length !== 1 ? "is" : ""}
              </p>
            </div>
          </div>

          {documents.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-sm text-muted-foreground">
                  Nenhum documento disponível para consulta pública neste protocolo.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.originalName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(doc.sizeBytes)} · {formatDate(new Date(doc.createdAt))}
                      </p>
                      {doc.description && (
                        <p className="text-xs text-muted-foreground italic mt-0.5">
                          {doc.description}
                        </p>
                      )}
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline flex-shrink-0"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Baixar
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
