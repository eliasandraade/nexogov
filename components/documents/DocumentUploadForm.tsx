"use client"

import { useState, useRef } from "react"
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
import { Paperclip, Loader2, X, Upload, Trash2 } from "lucide-react"
import { formatFileSize } from "@/lib/utils/format"
import { DOCUMENT_CATEGORY_LABELS } from "@/lib/utils/labels"
import { toast } from "sonner"

interface DocumentUploadFormProps {
  protocolId: string
}

interface FileEntry {
  file: File
  description: string
  visibility: string
  category: string
}

const MAX_SIZE = 20 * 1024 * 1024
const MAX_FILES = 10

export function DocumentUploadForm({ protocolId }: DocumentUploadFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [entries, setEntries] = useState<FileEntry[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files
    if (!selected) return
    setError(null)

    const newEntries: FileEntry[] = []
    for (let i = 0; i < selected.length; i++) {
      if (entries.length + newEntries.length >= MAX_FILES) {
        setError(`Máximo de ${MAX_FILES} arquivos por vez.`)
        break
      }
      const file = selected[i]
      if (file.size > MAX_SIZE) {
        setError(`"${file.name}" excede 20 MB.`)
        continue
      }
      newEntries.push({ file, description: "", visibility: "RESTRICTED_BY_PROTOCOL_PASSWORD", category: "" })
    }

    setEntries((prev) => [...prev, ...newEntries])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function removeEntry(index: number) {
    setEntries((prev) => prev.filter((_, i) => i !== index))
  }

  function updateEntry(index: number, key: keyof Omit<FileEntry, "file">, value: string) {
    setEntries((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, [key]: value } : entry))
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (entries.length === 0) { setError("Selecione ao menos um arquivo."); return }

    setLoading(true)
    setError(null)
    setUploadProgress(0)

    let uploaded = 0
    let lastError: string | null = null

    for (const entry of entries) {
      const formData = new FormData()
      formData.append("file", entry.file)
      formData.append("protocolId", protocolId)
      formData.append("description", entry.description)
      formData.append("visibility", entry.visibility)
      if (entry.category) formData.append("category", entry.category)

      try {
        const res = await fetch("/api/documents", { method: "POST", body: formData })
        const data = await res.json()
        if (!res.ok) {
          lastError = data.error ?? `Erro ao enviar "${entry.file.name}".`
        } else {
          uploaded++
        }
      } catch {
        lastError = `Erro de conexão ao enviar "${entry.file.name}".`
      }
      setUploadProgress(Math.round(((uploaded + (lastError ? 1 : 0)) / entries.length) * 100))
    }

    setLoading(false)

    if (uploaded > 0) {
      toast.success(`${uploaded} documento${uploaded !== 1 ? "s" : ""} anexado${uploaded !== 1 ? "s" : ""}.`)
    }
    if (lastError) {
      setError(lastError)
    }
    if (!lastError) {
      handleClose()
    }
    router.refresh()
  }

  function handleClose() {
    if (loading) return
    setOpen(false)
    setEntries([])
    setError(null)
    setUploadProgress(0)
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
          <div className="bg-card rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="text-base font-semibold">Juntar Documentos</h2>
              <button onClick={handleClose} disabled={loading} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* File picker area */}
              <div className="space-y-2">
                <Label>Arquivos *</Label>
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="space-y-2 text-muted-foreground">
                    <Upload className="h-8 w-8 mx-auto opacity-40" />
                    <p className="text-sm">Clique para selecionar arquivos</p>
                    <p className="text-xs">PDF, Word, Excel, Imagens — máx. 20 MB cada — até {MAX_FILES} arquivos</p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={handleFilesSelected}
                />
              </div>

              {/* File entries */}
              {entries.length > 0 && (
                <div className="space-y-3">
                  {entries.map((entry, i) => (
                    <div key={i} className="border rounded-md p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{entry.file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(entry.file.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEntry(i)}
                          disabled={loading}
                          className="text-muted-foreground hover:text-destructive ml-2"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={entry.category}
                          onValueChange={(v) => updateEntry(i, "category", v)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Classificação..." />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={entry.visibility}
                          onValueChange={(v) => updateEntry(i, "visibility", v)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="RESTRICTED_BY_PROTOCOL_PASSWORD">
                              Restrito (requer senha)
                            </SelectItem>
                            <SelectItem value="INTERNAL">
                              Interno (apenas usuários)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Textarea
                        placeholder="Descrição (opcional)..."
                        className="min-h-[40px] text-xs"
                        value={entry.description}
                        onChange={(e) => updateEntry(i, "description", e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Upload progress */}
              {loading && (
                <div className="space-y-1">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">{uploadProgress}%</p>
                </div>
              )}

              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading || entries.length === 0}>
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Enviando...</>
                  ) : (
                    <><Paperclip className="h-4 w-4" />Juntar {entries.length > 1 ? `${entries.length} Arquivos` : "ao Protocolo"}</>
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
