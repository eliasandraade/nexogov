"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-md">
        <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
        <h1 className="text-xl font-semibold">Algo deu errado</h1>
        <p className="text-sm text-muted-foreground">
          Ocorreu um erro inesperado. Tente novamente ou entre em contato com o administrador.
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-muted-foreground">Código: {error.digest}</p>
        )}
        <Button onClick={reset} variant="outline" size="sm">
          Tentar novamente
        </Button>
      </div>
    </div>
  )
}
