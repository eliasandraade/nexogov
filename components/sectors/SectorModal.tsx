"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface Secretariat { id: string; name: string; code: string }
interface Organ { id: string; name: string; secretariatId: string }

interface SectorModalProps {
  open: boolean
  onClose: () => void
  secretariats: Secretariat[]
  organs: Organ[]
  sector?: {
    id: string
    name: string
    code: string
    description?: string | null
    active: boolean
    secretariatId: string
    organId?: string | null
  } | null
}

export function SectorModal({ open, onClose, secretariats, organs, sector }: SectorModalProps) {
  const router = useRouter()
  const isEdit = !!sector

  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [secretariatId, setSecretariatId] = useState("")
  const [organId, setOrganId] = useState("")
  const [active, setActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const filteredOrgans = organs.filter((o) => o.secretariatId === secretariatId)

  useEffect(() => {
    if (sector) {
      setName(sector.name); setCode(sector.code)
      setDescription(sector.description ?? "")
      setSecretariatId(sector.secretariatId)
      setOrganId(sector.organId ?? ""); setActive(sector.active)
    } else {
      setName(""); setCode(""); setDescription("")
      setSecretariatId(secretariats[0]?.id ?? ""); setOrganId(""); setActive(true)
    }
    setError("")
  }, [sector, open, secretariats])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError("")

    const body = { name, code: code.toUpperCase(), description, secretariatId, organId: organId || "", ...(isEdit ? { active } : {}) }
    const url = isEdit ? `/api/sectors/${sector!.id}` : "/api/sectors"
    const method = isEdit ? "PATCH" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Erro ao salvar")
      setLoading(false); return
    }

    router.refresh(); onClose(); setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Setor" : "Novo Setor"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Secretaria</Label>
            <Select value={secretariatId} onValueChange={(v) => { setSecretariatId(v); setOrganId("") }}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {secretariats.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {filteredOrgans.length > 0 && (
            <div className="space-y-1">
              <Label>Órgão (opcional)</Label>
              <Select value={organId} onValueChange={(v) => setOrganId(v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {filteredOrgans.map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>Código</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required />
          </div>
          <div className="space-y-1">
            <Label>Descrição (opcional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          {isEdit && (
            <div className="flex items-center gap-3">
              <Switch checked={active} onCheckedChange={setActive} />
              <Label>{active ? "Ativo" : "Inativo"}</Label>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : isEdit ? "Salvar" : "Criar setor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
