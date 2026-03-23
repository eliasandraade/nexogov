import { Topbar } from "@/components/layout/Topbar"
import { Card } from "@/components/ui/card"

export default function QueueLoading() {
  return (
    <div>
      <Topbar title="Minha Fila" />
      <div className="p-6">
        <Card className="overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-4 px-5 py-3.5 border-b border-border last:border-0 animate-pulse">
              <div className="h-4 w-4 bg-muted rounded mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <div className="h-3 w-24 bg-muted rounded" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
                <div className="h-4 w-2/3 bg-muted rounded" />
                <div className="h-3 w-1/2 bg-muted rounded" />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
