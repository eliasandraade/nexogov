"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { USER_ROLE_LABELS } from "@/lib/utils/labels"
import type { UserRole } from "@prisma/client"

interface Secretariat { id: string; name: string; code: string }
interface Organ { id: string; name: string; secretariatId: string }
interface Sector { id: string; name: string; secretariatId: string; organId: string | null }

interface UserModalProps {
  open: boolean
  onClose: () => void
  user?: {
    id: string
    name: string
    email: string
    role: UserRole
    active: boolean
    secretariatId?: string | null
    organId?: string | null
    sectorId?: string | null
  } | null
}

export function UserModal({ open, onClose, user }: UserModalProps) {
  const router = useRouter()
  const isEdit = !!user

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("SERVIDOR_PUBLICO")
  const [active, setActive] = useState(true)
  const [secretariatId, setSecretariatId] = useState("")
  const [organId, setOrganId] = useState("")
  const [sectorId, setSectorId] = useState("")

  const [secretariats, setSecretariats] = useState<Secretariat[]>([])
  const [organs, setOrgans] = useState<Organ[]>([])
  const [sectors, setSectors] = useState<Sector[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    fetch("/api/org/secretariats")
      .then((r) => r.json())
      .then((data) => setSecretariats(data.secretariats ?? []))
    fetch("/api/organs")
      .then((r) => r.json())
      .then(setOrgans)
    fetch("/api/sectors")
      .then((r) => r.json())
      .then(setSectors)
  }, [open])

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setRole(user.role)
      setActive(user.active)
      setSecretariatId(user.secretariatId ?? "")
      setOrganId(user.organId ?? "")
      setSectorId(user.sectorId ?? "")
      setPassword("")
    } else {
      setName(""); setEmail(""); setPassword(""); setRole("SERVIDOR_PUBLICO")
      setActive(true); setSecretariatId(""); setOrganId(""); setSectorId("")
    }
    setError("")
  }, [user, open])

  const filteredOrgans = organs.filter((o) => !secretariatId || o.secretariatId === secretariatId)
  const filteredSectors = sectors.filter((s) => {
    if (secretariatId && s.secretariatId !== secretariatId) return false
    if (organId && s.organId !== organId) return false
    return true
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const body = {
      name, email, role,
      ...(password ? { password } : {}),
      secretariatId: secretariatId || "",
      organId: organId || "",
      sectorId: sectorId || "",
      ...(isEdit ? { active } : { password }),
    }

    const url = isEdit ? `/api/users/${user!.id}` : "/api/users"
    const method = isEdit ? "PATCH" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Erro ao salvar usuário")
      setLoading(false)
      return
    }

    router.refresh()
    onClose()
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label>Nome completo</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>E-mail</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>{isEdit ? "Nova senha (deixe em branco para manter)" : "Senha"}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!isEdit}
                placeholder={isEdit ? "deixe em branco para manter" : ""}
              />
              {password && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1">
                  {[
                    { ok: password.length >= 8, label: "8+ caracteres" },
                    { ok: /[A-Z]/.test(password), label: "Maiúscula" },
                    { ok: /[0-9]/.test(password), label: "Número" },
                    { ok: /[^A-Za-z0-9]/.test(password), label: "Caractere especial" },
                  ].map(({ ok, label }) => (
                    <p key={label} className={`text-xs flex items-center gap-1 ${ok ? "text-green-600" : "text-muted-foreground"}`}>
                      <span>{ok ? "✓" : "○"}</span> {label}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label>Perfil</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["ADMIN_SISTEMA", "DEV", "PREFEITO", "VICE_PREFEITO", "SECRETARIO", "GESTOR", "SERVIDOR_PUBLICO", "CONSELHEIRO"] as UserRole[]).map((r) => (
                    <SelectItem key={r} value={r}>{USER_ROLE_LABELS[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isEdit && (
              <div className="space-y-1">
                <Label>Ativo</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch checked={active} onCheckedChange={setActive} />
                  <span className="text-sm text-muted-foreground">{active ? "Ativo" : "Inativo"}</span>
                </div>
              </div>
            )}
            <div className="col-span-2 space-y-1">
              <Label>Secretaria</Label>
              <Select value={secretariatId} onValueChange={(v) => { setSecretariatId(v === "none" ? "" : v); setOrganId(""); setSectorId("") }}>
                <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {secretariats.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {filteredOrgans.length > 0 && (
              <div className="space-y-1">
                <Label>Órgão</Label>
                <Select value={organId} onValueChange={(v) => { setOrganId(v === "none" ? "" : v); setSectorId("") }}>
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
            {filteredSectors.length > 0 && (
              <div className="space-y-1">
                <Label>Setor</Label>
                <Select value={sectorId} onValueChange={(v) => setSectorId(v === "none" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {filteredSectors.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar usuário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
