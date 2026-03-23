"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Loader2, Eye, EyeOff, RefreshCw, Plus, Trash2, Upload, X, FileText } from "lucide-react"
import { createProtocolValidator } from "@/validators/protocol.validator"
import { formatFileSize } from "@/lib/utils/format"
import { toast } from "sonner"

interface Secretariat {
  id: string
  name: string
  code: string
}

interface Sector {
  id: string
  name: string
  code: string
  secretariatId: string
  organId: string | null
}

interface NewProtocolFormProps {
  secretariats: Secretariat[]
  sectors: Sector[]
  defaultSecretariatId?: string
  defaultSectorId?: string
}

interface Requester {
  name: string
  document: string
  company: string
}

interface AttachedFile {
  file: File
  description: string
  visibility: "RESTRICTED_BY_PROTOCOL_PASSWORD" | "INTERNAL"
}

const MAX_SIZE = 20 * 1024 * 1024

function generatePassword(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("")
}

export function NewProtocolForm({
  secretariats,
  sectors,
  defaultSecretariatId,
  defaultSectorId,
}: NewProtocolFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploadStep, setUploadStep] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "ADMINISTRATIVE",
    priority: "NORMAL",
    internalNotes: "",
    password: "",
    originSecretariatId: defaultSecretariatId ?? "",
    originSectorId: defaultSectorId ?? "",
    currentSecretariatId: defaultSecretariatId ?? "",
    currentSectorId: defaultSectorId ?? "",
    deadlineAt: "",
  })

  const [requesters, setRequesters] = useState<Requester[]>([])
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])

  const originSectors = sectors.filter((s) => s.secretariatId === form.originSecretariatId)
  const currentSectors = sectors.filter((s) => s.secretariatId === form.currentSecretariatId)

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // --- Requesters ---
  function addRequester() {
    setRequesters((prev) => [...prev, { name: "", document: "", company: "" }])
  }
  function updateRequester(index: number, key: keyof Requester, value: string) {
    setRequesters((prev) => prev.map((r, i) => i === index ? { ...r, [key]: value } : r))
  }
  function removeRequester(index: number) {
    setRequesters((prev) => prev.filter((_, i) => i !== index))
  }

  // --- Files ---
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    const valid: AttachedFile[] = []
    for (const file of selected) {
      if (file.size > MAX_SIZE) {
        setError(`"${file.name}" excede o limite de 20 MB.`)
        continue
      }
      valid.push({ file, description: "", visibility: "RESTRICTED_BY_PROTOCOL_PASSWORD" })
    }
    setAttachedFiles((prev) => [...prev, ...valid])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }
  function updateFile(index: number, key: keyof AttachedFile, value: string) {
    setAttachedFiles((prev) => prev.map((f, i) => i === index ? { ...f, [key]: value } : f))
  }
  function removeFile(index: number) {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const parsed = createProtocolValidator.safeParse({
      ...form,
      originOrganId: "",
      currentOrganId: "",
      requesters: requesters.filter((r) => r.name.trim()),
    })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos")
      return
    }

    setLoading(true)
    try {
      // Step 1: Create protocol
      setUploadStep("Registrando protocolo...")
      const res = await fetch("/api/protocols", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Erro ao criar protocolo")
        return
      }

      const protocolId = data.id as string

      // Step 2: Upload files
      if (attachedFiles.length > 0) {
        for (let i = 0; i < attachedFiles.length; i++) {
          const f = attachedFiles[i]
          setUploadStep(`Enviando documento ${i + 1} de ${attachedFiles.length}...`)
          const formData = new FormData()
          formData.append("file", f.file)
          formData.append("protocolId", protocolId)
          formData.append("description", f.description)
          formData.append("visibility", f.visibility)
          await fetch("/api/documents", { method: "POST", body: formData })
        }
      }

      toast.success("Protocolo registrado com sucesso!")
      router.push(`/protocols/${protocolId}`)
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
      setUploadStep(null)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Informações do Protocolo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Título descritivo do protocolo"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select value={form.type} onValueChange={(v) => update("type", v)}>
                <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMINISTRATIVE">Administrativo</SelectItem>
                  <SelectItem value="FINANCIAL">Financeiro</SelectItem>
                  <SelectItem value="LEGAL">Jurídico</SelectItem>
                  <SelectItem value="TECHNICAL">Técnico</SelectItem>
                  <SelectItem value="HUMAN_RESOURCES">Recursos Humanos</SelectItem>
                  <SelectItem value="SOCIAL">Social</SelectItem>
                  <SelectItem value="ENVIRONMENTAL">Ambiental</SelectItem>
                  <SelectItem value="OTHER">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={form.priority} onValueChange={(v) => update("priority", v)}>
                <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Baixa</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                placeholder="Descreva detalhadamente o objeto deste protocolo..."
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="password">
                Senha do Protocolo *{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  (necessária para acessar documentos externamente)
                </span>
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 4 caracteres"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    className="pr-10 font-mono text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="Gerar senha aleatória (256 bits)"
                  onClick={() => { update("password", generatePassword()); setShowPassword(true) }}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadlineAt">Prazo (opcional)</Label>
              <Input
                id="deadlineAt"
                type="date"
                value={form.deadlineAt}
                onChange={(e) => update("deadlineAt", e.target.value ? new Date(e.target.value).toISOString() : "")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requesters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              Interessados
              {requesters.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">{requesters.length}</Badge>
              )}
            </CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addRequester}>
              <Plus className="h-3.5 w-3.5" />
              Adicionar Interessado
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {requesters.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum interessado adicionado. Clique em "Adicionar Interessado" se necessário.
            </p>
          ) : (
            <div className="space-y-4">
              {requesters.map((r, i) => (
                <div key={i} className="p-3 border rounded-md space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => removeRequester(i)}
                    className="absolute top-3 right-3 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Interessado {i + 1}
                  </p>
                  <div className="grid grid-cols-2 gap-3 pr-6">
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Nome *</Label>
                      <Input
                        placeholder="Nome completo"
                        value={r.name}
                        onChange={(e) => updateRequester(i, "name", e.target.value)}
                        className="h-8 text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">CPF / CNPJ</Label>
                      <Input
                        placeholder="000.000.000-00"
                        value={r.document}
                        onChange={(e) => updateRequester(i, "document", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Empresa / Associação</Label>
                      <Input
                        placeholder="Opcional"
                        value={r.company}
                        onChange={(e) => updateRequester(i, "company", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Origin & Destination */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Origem e Destino Inicial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Secretaria de Origem *</Label>
              <Select
                value={form.originSecretariatId}
                onValueChange={(v) => { update("originSecretariatId", v); update("originSectorId", "") }}
              >
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {secretariats.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Setor de Origem</Label>
              <Select
                value={form.originSectorId}
                onValueChange={(v) => update("originSectorId", v)}
                disabled={!form.originSecretariatId}
              >
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {originSectors.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator className="col-span-2" />

            <div className="space-y-2">
              <Label>Secretaria Atual *</Label>
              <Select
                value={form.currentSecretariatId}
                onValueChange={(v) => { update("currentSecretariatId", v); update("currentSectorId", "") }}
              >
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {secretariats.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Setor Atual</Label>
              <Select
                value={form.currentSectorId}
                onValueChange={(v) => update("currentSectorId", v)}
                disabled={!form.currentSecretariatId}
              >
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {currentSectors.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              Documentos Iniciais
              {attachedFiles.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">{attachedFiles.length}</Badge>
              )}
            </CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-3.5 w-3.5" />
              Selecionar Arquivos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleFileSelect}
          />

          {attachedFiles.length === 0 ? (
            <div
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-7 w-7 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Clique para selecionar ou arraste arquivos aqui
              </p>
              <p className="text-xs text-muted-foreground mt-1">PDF, Word, Excel, Imagens — máx. 20 MB cada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attachedFiles.map((f, i) => (
                <div key={i} className="flex gap-3 p-3 border rounded-md items-start">
                  <FileText className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{f.file.name}</p>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatFileSize(f.file.size)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Descrição (opcional)"
                        value={f.description}
                        onChange={(e) => updateFile(i, "description", e.target.value)}
                        className="h-7 text-xs"
                      />
                      <Select
                        value={f.visibility}
                        onValueChange={(v) => updateFile(i, "visibility", v)}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RESTRICTED_BY_PROTOCOL_PASSWORD">Restrito</SelectItem>
                          <SelectItem value="INTERNAL">Interno</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-muted-foreground hover:text-destructive mt-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar mais arquivos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Internal notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Observações Internas (opcional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Anotações internas não visíveis na consulta pública..."
            value={form.internalNotes}
            onChange={(e) => update("internalNotes", e.target.value)}
          />
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex gap-3 items-center">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {uploadStep ?? "Processando..."}
            </>
          ) : (
            "Registrar Protocolo"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
        {attachedFiles.length > 0 && !loading && (
          <span className="text-xs text-muted-foreground">
            {attachedFiles.length} documento{attachedFiles.length !== 1 ? "s" : ""} para enviar
          </span>
        )}
      </div>
    </form>
  )
}
