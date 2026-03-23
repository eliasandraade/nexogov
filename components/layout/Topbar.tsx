import { Breadcrumbs } from "./Breadcrumbs"

interface TopbarProps {
  title: string
  subtitle?: string
}

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-6 pl-14 lg:pl-6 gap-6 sticky top-0 z-30 backdrop-blur-sm">
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
      <div className="hidden sm:flex items-center">
        <Breadcrumbs />
      </div>
    </header>
  )
}
