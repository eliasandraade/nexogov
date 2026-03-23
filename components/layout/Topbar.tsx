import { Breadcrumbs } from "./Breadcrumbs"

interface TopbarProps {
  title: string
  subtitle?: string
}

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-6 pl-14 lg:pl-6 gap-4 sticky top-0 z-30">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-foreground truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      <div className="hidden sm:block">
        <Breadcrumbs />
      </div>
    </header>
  )
}
