import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-md">
        <FileQuestion className="h-10 w-10 text-muted-foreground mx-auto" />
        <h1 className="text-xl font-semibold">Página não encontrada</h1>
        <p className="text-sm text-muted-foreground">
          O recurso que você está procurando não existe ou foi removido.
        </p>
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            Voltar ao Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
