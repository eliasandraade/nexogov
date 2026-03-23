import { Breadcrumbs } from "./Breadcrumbs"
import { NotificationBell } from "@/components/notifications/NotificationBell"
import { GlobalSearch } from "./GlobalSearch"

interface TopbarProps {
  title: string
  subtitle?: string
}

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-6 pl-14 lg:pl-6 gap-4 sticky top-0 z-30 backdrop-blur-sm">
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-semibold text-foreground truncate leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate mt-0.5 leading-none">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <GlobalSearch />
        <NotificationBell />
        <div className="hidden sm:flex items-center">
          <Breadcrumbs />
        </div>
      </div>
    </header>
  )
}
