"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Send, Loader2, X } from "lucide-react"

interface Secretariat {
  id: string
  name: string
  code: string
}

interface Sector {
  id: string
  name: string
  secretariatId: string
}

interface ForwardProtocolButtonProps {
  protocolId: string
}

export function ForwardProtocolButton({ protocolId }: ForwardProtocolButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [secretariats, setSecretariats] = useState<Secretariat[]>([])
  const [sectors, setSectors] = useState<Sector[]>([])

  const [toSecretariatId, setToSecretariatId] = useState("")
  const [toSectorId, setToSectorId] = useState("")
  const [description, setDescription] = useState("")
  const [notes, setNotes] = useState("")

  // Load org data when modal opens
  useEffect(() => {
    if (!open || secretariats.length > 0) return
    fetch("/api/org/secretariats")
      .then((r) => r.json())
      .then((data) => {
        setSecretariats(data.secretariats ?? [])
        setSectors(data.sectors ?? [])
      })
      .catch(() => setError("Erro ao carregar secretarias."))
  }, [open, secretariats.length])

  const filteredSectors = sectors.filter((s) => s.secretariatId === toSecretariatId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!toSecretariatId || !description.trim()) {
      setError("Selecione o destino e preencha a descrição.")
      return
    }

    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`/api/protocols/${protocolId}/forward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          notes: notes || undefined,
          toSecretariatId,
          toSectorId: toSectorId || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Erro ao encaminhar.")
        return
      }

      setOpen(false)
      router.refresh()
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    if (loading) return
    setOpen(false)
    setToSecretariatId("")
    setToSectorId("")
    setDescription("")
    setNotes("")
    setError(null)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Send className="h-4 w-4" />
        Encaminhar
      </Button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="bg-card rounded-lg shadow-xl w-full max-w-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-semibold">Encaminhar Protocolo</h2>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
                disabled={loading}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Destination secretariat */}
              <div className="space-y-2">
                <Label>Secretaria de Destino *</Label>
                <Select
                  value={toSecretariatId}
                  onValueChange={(v) => {
                    setToSecretariatId(v)
                    setToSectorId("")
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a secretaria..." />
                  </SelectTrigger>
                  <SelectContent>
                    {secretariats.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.code} — {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Destination sector */}
              {filteredSectors.length > 0 && (
                <div className="space-y-2">
                  <Label>Setor de Destino</Label>
                  <Select
                    value={toSectorId}
                    onValueChange={setToSectorId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o setor (opcional)..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSectors.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <Label>Descrição do Encaminhamento *</Label>
                <Textarea
                  placeholder="Descreva o motivo ou instrução deste encaminhamento..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[80px]"
                  required
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Observações Internas</Label>
                <Textarea
                  placeholder="Anotações complementares (opcional)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading || !toSecretariatId || !description.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Encaminhando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Confirmar Encaminhamento
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
