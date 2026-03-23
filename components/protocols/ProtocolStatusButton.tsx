"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { RefreshCw, Loader2, X } from "lucide-react"
import { PROTOCOL_STATUS_LABELS } from "@/lib/utils/labels"
import { toast } from "sonner"

const EDITABLE_STATUSES = ["OPEN", "IN_PROGRESS", "PENDING", "DEFERRED", "REJECTED", "CLOSED", "ARCHIVED"]
const DESTRUCTIVE_STATUSES = ["REJECTED", "CLOSED", "ARCHIVED"]

interface ProtocolStatusButtonProps {
  protocolId: string
  currentStatus: string
}

export function ProtocolStatusButton({ protocolId, currentStatus }: ProtocolStatusButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState(currentStatus)
  const [notes, setNotes] = useState("")

  async function doSubmit() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/protocols/${protocolId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes: notes || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Erro ao atualizar."); return }
      toast.success(`Status alterado para "${PROTOCOL_STATUS_LABELS[status]}"`)
      handleClose()
      router.refresh()
    } catch {
      setError("Erro de conexão.")
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === currentStatus) { handleClose(); return }

    if (DESTRUCTIVE_STATUSES.includes(status)) {
      setConfirmOpen(true)
      return
    }
    doSubmit()
  }

  function handleClose() {
    if (loading) return
    setOpen(false)
    setNotes("")
    setError(null)
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <RefreshCw className="h-4 w-4" />
        Alterar Status
      </Button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="bg-card rounded-lg shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-semibold">Alterar Status</h2>
              <button onClick={handleClose} disabled={loading} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Novo Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EDITABLE_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {PROTOCOL_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Observação (opcional)</Label>
                <Textarea
                  placeholder="Justifique a alteração de status..."
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
                <Button type="submit" disabled={loading || status === currentStatus}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar"}
                </Button>
                <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation dialog for destructive actions */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {status === "CLOSED" ? "Encerrar protocolo?" : status === "REJECTED" ? "Indeferir protocolo?" : "Arquivar protocolo?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {status === "CLOSED"
                ? "Ao encerrar, o protocolo não poderá mais receber encaminhamentos. Deseja continuar?"
                : status === "REJECTED"
                ? "Ao indeferir, o protocolo será marcado como negado/rejeitado. Esta ação pode ser revertida. Deseja continuar?"
                : "Ao arquivar, o protocolo será removido da tramitação ativa. Deseja continuar?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { setConfirmOpen(false); doSubmit() }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {status === "CLOSED" ? "Sim, encerrar" : status === "REJECTED" ? "Sim, indeferir" : "Sim, arquivar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
