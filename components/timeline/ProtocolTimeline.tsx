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
  CREATION: "bg-blue-100 text-blue-700",
  FORWARDING: "bg-orange-100 text-orange-700",
  RECEIPT: "bg-purple-100 text-purple-700",
  DISPATCH: "bg-gray-100 text-gray-700",
  ADMINISTRATIVE_OPINION: "bg-yellow-100 text-yellow-700",
  DOCUMENT_ATTACHMENT: "bg-green-100 text-green-700",
  STATUS_UPDATE: "bg-indigo-100 text-indigo-700",
  FINALIZATION: "bg-emerald-100 text-emerald-700",
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
          const colorClass = MOVEMENT_COLORS[movement.type] ?? "bg-gray-100 text-gray-700"
          const isLast = index === movements.length - 1

          return (
            <div key={movement.id} className={cn("flex gap-4 pb-6", isLast && "pb-0")}>
              {/* Icon */}
              <div className={cn("relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", colorClass)}>
                <Icon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-foreground">
                    {MOVEMENT_TYPE_LABELS[movement.type] ?? movement.type}
                  </span>
                  {movement.isInterSecretariat && (
                    <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">
                      Inter-secretaria
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  {movement.description}
                </p>

                {/* Route */}
                {(movement.fromSecretariat || movement.toSecretariat) && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2 bg-muted/50 rounded px-2 py-1 w-fit">
                    {movement.fromSecretariat && (
                      <span className="font-medium">{movement.fromSecretariat.code}</span>
                    )}
                    {movement.fromSector && (
                      <span>/ {movement.fromSector.name}</span>
                    )}
                    {movement.toSecretariat && (
                      <>
                        <ArrowRight className="h-3 w-3 flex-shrink-0" />
                        <span className="font-medium">{movement.toSecretariat.code}</span>
                        {movement.toSector && (
                          <span>/ {movement.toSector.name}</span>
                        )}
                      </>
                    )}
                  </div>
                )}

                {movement.notes && (
                  <p className="text-xs italic text-muted-foreground border-l-2 border-border pl-2 mb-2">
                    {movement.notes}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{movement.performedBy.name}</span>
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
