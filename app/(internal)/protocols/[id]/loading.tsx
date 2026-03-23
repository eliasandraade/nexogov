import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ProtocolDetailLoading() {
  return (
    <div>
      <div className="h-16 border-b border-border" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="h-6 w-32 bg-muted animate-pulse rounded" />
              <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
              <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
            </div>
            <div className="h-6 w-80 bg-muted animate-pulse rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-36 bg-muted animate-pulse rounded-md" />
            <div className="h-9 w-36 bg-muted animate-pulse rounded-md" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><div className="h-4 w-24 bg-muted animate-pulse rounded" /></CardHeader>
              <CardContent className="space-y-2">
                <div className="h-3 w-full bg-muted animate-pulse rounded" />
                <div className="h-3 w-5/6 bg-muted animate-pulse rounded" />
                <div className="h-3 w-4/6 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><div className="h-4 w-40 bg-muted animate-pulse rounded" /></CardHeader>
              <CardContent>
                <div className="h-40 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader><div className="h-4 w-32 bg-muted animate-pulse rounded" /></CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-3 w-full bg-muted animate-pulse rounded" />
                  <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
