import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ReportsLoading() {
  return (
    <div>
      <div className="h-16 border-b border-border" />
      <div className="p-6 space-y-6 max-w-3xl">
        <Card>
          <CardHeader><div className="h-4 w-40 bg-muted animate-pulse rounded" /></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-9 w-full bg-muted animate-pulse rounded-md" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <div className="h-9 w-40 bg-muted animate-pulse rounded-md" />
              <div className="h-9 w-48 bg-muted animate-pulse rounded-md" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><div className="h-4 w-36 bg-muted animate-pulse rounded" /></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
