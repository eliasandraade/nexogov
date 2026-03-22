"use client"

import { useState, useRef } from "react"
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
import { Paperclip, Loader2, X, Upload } from "lucide-react"
import { formatFileSize } from "@/lib/utils/format"

interface DocumentUploadFormProps {
  protocolId: string
}

const MAX_SIZE = 20 * 1024 * 1024

export function DocumentUploadForm({ protocolId }: DocumentUploadFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState("")
  const [visibility, setVisibility] = useState("RESTRICTED_BY_PROTOCOL_PASSWORD")

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    setError(null)
    if (!selected) return
    if (selected.size > MAX_SIZE) {
      setError("Arquivo muito grande. Limite: 20 MB.")
      return
    }
    setFile(selected)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { setError("Selecione um arquivo."); return }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("protocolId", protocolId)
    formData.append("description", description)
    formData.append("visibility", visibility)

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Erro no upload."); return }

      setOpen(false)
      setFile(null)
      setDescription("")
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
    setFile(null)
    setDescription("")
    setError(null)
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Paperclip className="h-4 w-4" />
        Juntar Documento
      </Button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="bg-card rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-semibold">Juntar Documento</h2>
              <button onClick={handleClose} disabled={loading} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* File picker */}
              <div className="space-y-2">
                <Label>Arquivo *</Label>
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {file ? (
                    <div className="space-y-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-muted-foreground">
                      <Upload className="h-8 w-8 mx-auto opacity-40" />
                      <p className="text-sm">Clique para selecionar um arquivo</p>
                      <p className="text-xs">PDF, Word, Excel, Imagens — máx. 20 MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <Label>Visibilidade</Label>
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RESTRICTED_BY_PROTOCOL_PASSWORD">
                      Restrito (requer senha do protocolo)
                    </SelectItem>
                    <SelectItem value="INTERNAL">
                      Interno (apenas usuários do sistema)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Textarea
                  placeholder="Descreva o conteúdo ou finalidade do documento..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading || !file}>
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Enviando...</>
                  ) : (
                    <><Paperclip className="h-4 w-4" />Juntar ao Protocolo</>
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
