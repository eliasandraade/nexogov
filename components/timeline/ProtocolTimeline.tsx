import { formatDate } from "@/lib/utils/format"
import { MOVEMENT_TYPE_LABELS } from "@/lib/utils/labels"
import { cn } from "@/lib/utils/cn"
import {
  FileText,
  ArrowRight,
  CheckCircle,
  MessageSquare,
  Paperclip,
  RefreshCw,
  Send,
  Plus,
} from "lucide-react"

interface Movement {
  id: string
  type: string
  description: string
  notes: string | null
  isInterSecretariat: boolean
  fromSecretariat: { name: string; code: string } | null
  fromSector: { name: string } | null
  toSecretariat: { name: string; code: string } | null
  toSector: { name: string } | null
  performedBy: { name: string }
  createdAt: Date
}

const MOVEMENT_ICONS: Record<string, React.ElementType> = {
  CREATION: Plus,
  FORWARDING: Send,
  RECEIPT: ArrowRight,
  DISPATCH: FileText,
  ADMINISTRATIVE_OPINION: MessageSquare,
  DOCUMENT_ATTACHMENT: Paperclip,
  STATUS_UPDATE: RefreshCw,
  FINALIZATION: CheckCircle,
}

const MOVEMENT_COLORS: Record<string, string> = {
  CREATION: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400",
  FORWARDING: "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400",
  RECEIPT: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400",
  DISPATCH: "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400",
  ADMINISTRATIVE_OPINION: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-400",
  DOCUMENT_ATTACHMENT: "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400",
  STATUS_UPDATE: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400",
  FINALIZATION: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
}

export function ProtocolTimeline({ movements }: { movements: Movement[] }) {
  if (movements.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma movimentação registrada.
      </p>
    )
  }

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-4 w-px bg-border" />
      <div className="space-y-0">
        {movements.map((movement, index) => {
          const Icon = MOVEMENT_ICONS[movement.type] ?? FileText
          const colorClass = MOVEMENT_COLORS[movement.type] ?? "bg-slate-100 text-slate-600"
          const isLast = index === movements.length - 1
          const delay = Math.min(index * 40, 320)

          return (
            <div
              key={movement.id}
              className={cn("flex gap-4 pb-6 animate-slide-up", isLast && "pb-0")}
              style={{ animationDelay: `${delay}ms` }}
            >
              {/* Icon */}
              <div className={cn(
                "relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ring-2 ring-background",
                colorClass
              )}>
                <Icon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="flex-1 pt-1 pb-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-foreground">
                    {MOVEMENT_TYPE_LABELS[movement.type] ?? movement.type}
                  </span>
                  {movement.isInterSecretariat && (
                    <span className="text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 px-1.5 py-0.5 rounded font-medium">
                      Inter-secretaria
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  {movement.description}
                </p>

                {/* Route */}
                {(movement.fromSecretariat || movement.toSecretariat) && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2 bg-muted/60 rounded-md px-2.5 py-1.5 w-fit border border-border/60">
                    {movement.fromSecretariat && (
                      <span className="font-semibold text-foreground/70">{movement.fromSecretariat.code}</span>
                    )}
                    {movement.fromSector && (
                      <span>/ {movement.fromSector.name}</span>
                    )}
                    {movement.toSecretariat && (
                      <>
                        <ArrowRight className="h-3 w-3 flex-shrink-0 text-primary" />
                        <span className="font-semibold text-foreground/70">{movement.toSecretariat.code}</span>
                        {movement.toSector && (
                          <span>/ {movement.toSector.name}</span>
                        )}
                      </>
                    )}
                  </div>
                )}

                {movement.notes && (
                  <p className="text-xs italic text-muted-foreground border-l-2 border-primary/30 pl-2.5 mb-2 bg-muted/30 py-1 rounded-r">
                    {movement.notes}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                  <span className="font-medium">{movement.performedBy.name}</span>
                  <span>·</span>
                  <span>{formatDate(movement.createdAt, true)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
