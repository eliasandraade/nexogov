"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import { createProtocolValidator } from "@/validators/protocol.validator"

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

export function NewProtocolForm({
  secretariats,
  sectors,
  defaultSecretariatId,
  defaultSectorId,
}: NewProtocolFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "ADMINISTRATIVE",
    priority: "NORMAL",
    requesterName: "",
    requesterDocument: "",
    internalNotes: "",
    password: "",
    originSecretariatId: defaultSecretariatId ?? "",
    originSectorId: defaultSectorId ?? "",
    currentSecretariatId: defaultSecretariatId ?? "",
    currentSectorId: defaultSectorId ?? "",
  })

  const originSectors = sectors.filter(
    (s) => s.secretariatId === form.originSecretariatId
  )
  const currentSectors = sectors.filter(
    (s) => s.secretariatId === form.currentSecretariatId
  )

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const parsed = createProtocolValidator.safeParse({
      ...form,
      originOrganId: "",
      currentOrganId: "",
    })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos")
      return
    }

    setLoading(true)
    try {
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

      router.push(`/protocols/${data.id}`)
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
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
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
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
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
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
                  (necessária para acessar documentos)
                </span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 4 caracteres"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requester */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Interessado (opcional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requesterName">Nome</Label>
              <Input
                id="requesterName"
                placeholder="Nome do interessado"
                value={form.requesterName}
                onChange={(e) => update("requesterName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requesterDocument">CPF / CNPJ</Label>
              <Input
                id="requesterDocument"
                placeholder="000.000.000-00"
                value={form.requesterDocument}
                onChange={(e) => update("requesterDocument", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Origin */}
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
                onValueChange={(v) => {
                  update("originSecretariatId", v)
                  update("originSectorId", "")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
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

            <div className="space-y-2">
              <Label>Setor de Origem</Label>
              <Select
                value={form.originSectorId}
                onValueChange={(v) => update("originSectorId", v)}
                disabled={!form.originSecretariatId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {originSectors.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator className="col-span-2" />

            <div className="space-y-2">
              <Label>Secretaria Atual *</Label>
              <Select
                value={form.currentSecretariatId}
                onValueChange={(v) => {
                  update("currentSecretariatId", v)
                  update("currentSectorId", "")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
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

            <div className="space-y-2">
              <Label>Setor Atual</Label>
              <Select
                value={form.currentSectorId}
                onValueChange={(v) => update("currentSectorId", v)}
                disabled={!form.currentSecretariatId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {currentSectors.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
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

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Registrando...
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
      </div>
    </form>
  )
}
