import { Card, CardContent } from "@/components/ui/card"

export default function MetricsLoading() {
  return (
    <div>
      <div className="h-16 border-b border-border" />
      <div className="p-6 space-y-6">
        {/* KPI skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-5 space-y-3">
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                <div className="h-8 w-14 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Table skeleton */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
