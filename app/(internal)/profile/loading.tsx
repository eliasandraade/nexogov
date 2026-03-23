import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ProfileLoading() {
  return (
    <div>
      <div className="h-16 border-b border-border" />
      <div className="p-6 max-w-2xl space-y-6">
        <Card>
          <CardHeader><div className="h-4 w-40 bg-muted animate-pulse rounded" /></CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                <div className="h-9 w-full bg-muted animate-pulse rounded-md" />
              </div>
            ))}
            <div className="h-9 w-32 bg-muted animate-pulse rounded-md" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><div className="h-4 w-36 bg-muted animate-pulse rounded" /></CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                <div className="h-9 w-full bg-muted animate-pulse rounded-md" />
              </div>
            ))}
            <div className="h-9 w-40 bg-muted animate-pulse rounded-md" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
