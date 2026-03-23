export default function ProtocolsLoading() {
  return (
    <div>
      <div className="h-16 border-b border-border" />
      <div className="p-6 space-y-4">
        {/* Filters skeleton */}
        <div className="flex flex-wrap gap-3">
          <div className="h-9 w-56 bg-muted animate-pulse rounded-md" />
          <div className="h-9 w-36 bg-muted animate-pulse rounded-md" />
          <div className="h-9 w-36 bg-muted animate-pulse rounded-md" />
          <div className="h-9 w-36 bg-muted animate-pulse rounded-md" />
          <div className="ml-auto h-9 w-36 bg-muted animate-pulse rounded-md" />
        </div>
        {/* Table skeleton */}
        <div className="rounded-lg border overflow-hidden">
          <div className="h-10 bg-muted/50" />
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-14 border-t border-border px-4 flex items-center gap-4">
              <div className="h-3 w-28 bg-muted animate-pulse rounded" />
              <div className="h-3 w-48 bg-muted animate-pulse rounded" />
              <div className="h-5 w-20 bg-muted animate-pulse rounded-full" />
              <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
              <div className="ml-auto h-3 w-24 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
