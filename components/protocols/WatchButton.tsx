"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bell, BellOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function WatchButton({ protocolId }: { protocolId: string }) {
  const [watching, setWatching] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/protocols/${protocolId}/watch`)
      .then(r => r.json())
      .then(d => setWatching(d.watching))
      .finally(() => setLoading(false))
  }, [protocolId])

  async function toggle() {
    setLoading(true)
    try {
      const res = await fetch(`/api/protocols/${protocolId}/watch`, {
        method: watching ? "DELETE" : "POST",
      })
      const data = await res.json()
      setWatching(data.watching)
      toast.success(data.watching ? "Você está seguindo este protocolo." : "Deixou de seguir.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={toggle} disabled={loading} title={watching ? "Deixar de seguir" : "Seguir protocolo"}>
      {loading
        ? <Loader2 className="h-4 w-4 animate-spin" />
        : watching
          ? <><BellOff className="h-4 w-4 mr-1" />Seguindo</>
          : <><Bell className="h-4 w-4 mr-1" />Seguir</>
      }
    </Button>
  )
}
