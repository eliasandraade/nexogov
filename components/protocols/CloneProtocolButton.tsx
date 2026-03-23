"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Copy, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function CloneProtocolButton({ protocolId }: { protocolId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClone() {
    if (!confirm("Clonar este protocolo? Um novo protocolo será criado com os mesmos dados.")) return
    setLoading(true)
    try {
      const res = await fetch(`/api/protocols/${protocolId}/clone`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Erro ao clonar protocolo.")
        return
      }
      toast.success(`Protocolo ${data.number} criado com sucesso!`)
      router.push(`/protocols/${data.id}`)
    } catch {
      toast.error("Erro de conexão.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClone} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
      Clonar
    </Button>
  )
}
