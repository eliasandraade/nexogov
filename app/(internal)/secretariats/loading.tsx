export default function SecretariatsLoading() {
  return (
    <div>
      <div className="h-16 border-b border-border" />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <div className="h-9 w-40 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="rounded-lg border overflow-hidden">
          <div className="h-10 bg-muted/50" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 border-t border-border px-4 flex items-center gap-4">
              <div className="h-3 w-16 bg-muted animate-pulse rounded font-mono" />
              <div className="h-3 w-64 bg-muted animate-pulse rounded" />
              <div className="h-5 w-14 bg-muted animate-pulse rounded-full" />
              <div className="ml-auto h-3 w-20 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
