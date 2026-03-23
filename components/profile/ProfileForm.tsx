"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { KeyRound } from "lucide-react"

export function ProfileForm() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setError(""); setSuccess("")

    if (newPassword !== confirmPassword) {
      setError("A nova senha e a confirmação não coincidem.")
      return
    }
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      setError("A senha deve ter no mínimo 8 caracteres, uma letra maiúscula, um número e um caractere especial.")
      return
    }

    setLoading(true)
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Erro ao atualizar senha")
      return
    }

    setSuccess("Senha alterada com sucesso.")
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <KeyRound className="h-4 w-4" />
          Alterar Senha
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-1">
            <Label>Senha atual</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <Separator />
          <div className="space-y-1">
            <Label>Nova senha</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Mínimo 8 caracteres"
            />
            {newPassword && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1.5">
                {[
                  { ok: newPassword.length >= 8, label: "8+ caracteres" },
                  { ok: /[A-Z]/.test(newPassword), label: "Maiúscula" },
                  { ok: /[0-9]/.test(newPassword), label: "Número" },
                  { ok: /[^A-Za-z0-9]/.test(newPassword), label: "Caractere especial" },
                ].map(({ ok, label }) => (
                  <p key={label} className={`text-xs flex items-center gap-1 ${ok ? "text-green-600" : "text-muted-foreground"}`}>
                    <span>{ok ? "✓" : "○"}</span> {label}
                  </p>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <Label>Confirmar nova senha</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <Button type="submit" disabled={loading} size="sm">
            {loading ? "Salvando..." : "Alterar senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
