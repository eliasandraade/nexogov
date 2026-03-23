"use client"

import { useState } from "react"
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
import { FilePen, Loader2, X } from "lucide-react"
import { toast } from "sonner"

interface AddMovementButtonProps {
  protocolId: string
}

const MOVEMENT_OPTIONS = [
  { value: "DISPATCH", label: "Despacho" },
  { value: "ADMINISTRATIVE_OPINION", label: "Parecer Administrativo" },
  { value: "RECEIPT", label: "Recebimento Formal" },
] as const

export function AddMovementButton({ protocolId }: AddMovementButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [type, setType] = useState<string>("")
  const [description, setDescription] = useState("")
  const [notes, setNotes] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!type || !description.trim()) {
      setError("Selecione o tipo e preencha a descrição.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/protocols/${protocolId}/movement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, description, notes: notes || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Erro ao registrar movimentação.")
        return
      }
      toast.success("Movimentação registrada com sucesso!")
      handleClose()
      router.refresh()
    } catch {
      setError("Erro de conexão.")
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    if (loading) return
    setOpen(false)
    setType("")
    setDescription("")
    setNotes("")
    setError(null)
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <FilePen className="h-4 w-4" />
        Registrar Movimentação
      </Button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="bg-card rounded-lg shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-semibold">Registrar Movimentação</h2>
              <button onClick={handleClose} disabled={loading} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Movimentação *</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MOVEMENT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Descrição / Conteúdo *</Label>
                <Textarea
                  placeholder="Descreva o despacho, parecer ou recebimento..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                  required
                />
              </div>

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

              <div className="flex gap-3">
                <Button type="submit" disabled={loading || !type || !description.trim()}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrar"}
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
