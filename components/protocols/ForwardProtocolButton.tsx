"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

interface ForwardProtocolButtonProps {
  protocolId: string
}

export function ForwardProtocolButton({ protocolId }: ForwardProtocolButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Send className="h-4 w-4" />
        Encaminhar
      </Button>
      {/* Forward modal will be implemented in Phase 1 completion */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-base font-semibold mb-4">Encaminhar Protocolo</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Funcionalidade de encaminhamento será implementada na próxima etapa.
            </p>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Fechar
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
