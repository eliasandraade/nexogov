import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils/cn"
import type { LucideIcon } from "lucide-react"

type StatCardColor = "default" | "info" | "warning" | "success" | "destructive"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  sub?: React.ReactNode
  icon: LucideIcon
  color?: StatCardColor
}

const colorMap: Record<StatCardColor, { value: string; icon: string }> = {
  default:     { value: "text-foreground",   icon: "text-muted-foreground/40" },
  info:        { value: "text-info",         icon: "text-info/40" },
  warning:     { value: "text-warning",      icon: "text-warning/40" },
  success:     { value: "text-success",      icon: "text-success/40" },
  destructive: { value: "text-destructive",  icon: "text-destructive/40" },
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color = "default",
  className,
  ...props
}: StatCardProps) {
  const colors = colorMap[color]
  return (
    <Card className={className} {...props}>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide leading-none">
            {label}
          </span>
          <Icon className={cn("h-4 w-4 flex-shrink-0", colors.icon)} />
        </div>
        <p className={cn("text-3xl font-bold leading-none mt-2", colors.value)}>
          {value}
        </p>
        {sub && (
          <div className="text-xs text-muted-foreground mt-1.5 leading-snug">{sub}</div>
        )}
      </CardContent>
    </Card>
  )
}
