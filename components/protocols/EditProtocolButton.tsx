"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pencil, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { PROTOCOL_TYPE_LABELS, PROTOCOL_PRIORITY_LABELS } from "@/lib/utils/labels"
import type { ProtocolType, ProtocolPriority } from "@prisma/client"

interface EditProtocolButtonProps {
  protocolId: string
  current: {
    title: string
    description: string
    type: ProtocolType
    priority: ProtocolPriority
    internalNotes: string | null
    deadlineAt: Date | null
  }
}

export function EditProtocolButton({ protocolId, current }: EditProtocolButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(current.title)
  const [description, setDescription] = useState(current.description)
  const [type, setType] = useState<string>(current.type)
  const [priority, setPriority] = useState<string>(current.priority)
  const [internalNotes, setInternalNotes] = useState(current.internalNotes ?? "")
  const [deadlineAt, setDeadlineAt] = useState(
    current.deadlineAt
      ? new Date(current.deadlineAt).toISOString().slice(0, 10)
      : ""
  )

  function handleOpen() {
    setTitle(current.title)
    setDescription(current.description)
    setType(current.type)
    setPriority(current.priority)
    setInternalNotes(current.internalNotes ?? "")
    setDeadlineAt(
      current.deadlineAt
        ? new Date(current.deadlineAt).toISOString().slice(0, 10)
        : ""
    )
    setError(null)
    setOpen(true)
  }

  function handleClose() {
    if (loading) return
    setOpen(false)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const body: Record<string, unknown> = {
        title,
        description,
        type,
        priority,
        internalNotes: internalNotes || "",
        deadlineAt: deadlineAt
          ? new Date(deadlineAt + "T00:00:00").toISOString()
          : "",
      }

      const res = await fetch(`/api/protocols/${protocolId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Erro ao atualizar protocolo.")
        return
      }
      toast.success("Protocolo atualizado com sucesso!")
      handleClose()
      router.refresh()
    } catch {
      setError("Erro de conexão.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen}>
        <Pencil className="h-4 w-4" />
        Editar
      </Button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="bg-card rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card">
              <h2 className="text-base font-semibold">Editar Protocolo</h2>
              <button
                onClick={handleClose}
                disabled={loading}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição *</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                  disabled={loading}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={type} onValueChange={setType} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(PROTOCOL_TYPE_LABELS) as ProtocolType[]).map((t) => (
                        <SelectItem key={t} value={t}>
                          {PROTOCOL_TYPE_LABELS[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select value={priority} onValueChange={setPriority} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(PROTOCOL_PRIORITY_LABELS) as ProtocolPriority[]).map((p) => (
                        <SelectItem key={p} value={p}>
                          {PROTOCOL_PRIORITY_LABELS[p]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Prazo</Label>
                <Input
                  type="date"
                  value={deadlineAt}
                  onChange={(e) => setDeadlineAt(e.target.value)}
                  disabled={loading}
                />
                {deadlineAt && (
                  <button
                    type="button"
                    onClick={() => setDeadlineAt("")}
                    className="text-xs text-muted-foreground underline"
                  >
                    Remover prazo
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <Label>Notas Internas</Label>
                <Textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Anotações internas (não visíveis publicamente)..."
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={loading || !title.trim() || !description.trim()}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                >
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
