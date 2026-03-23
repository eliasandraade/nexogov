"use client"

interface FlowMatrixProps {
  secretariats: { id: string; code: string }[]
  flows: { fromId: string; toId: string; count: number }[]
}

export function FlowMatrix({ secretariats, flows }: FlowMatrixProps) {
  if (secretariats.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">Nenhum dado de fluxo.</p>
  }

  const flowMap = new Map<string, number>()
  let maxCount = 1
  for (const f of flows) {
    const key = `${f.fromId}:${f.toId}`
    flowMap.set(key, f.count)
    if (f.count > maxCount) maxCount = f.count
  }

  function getCellColor(count: number): string {
    if (count === 0) return ""
    const intensity = Math.round((count / maxCount) * 4)
    switch (intensity) {
      case 0: return "bg-blue-50 dark:bg-blue-950/30"
      case 1: return "bg-blue-100 dark:bg-blue-900/40"
      case 2: return "bg-blue-200 dark:bg-blue-800/50"
      case 3: return "bg-blue-300 dark:bg-blue-700/60"
      default: return "bg-blue-400 dark:bg-blue-600/70 text-white"
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="text-xs border-collapse w-full">
        <thead>
          <tr>
            <th className="p-1.5 text-left font-medium text-muted-foreground border-b border-r border-border">
              De \ Para
            </th>
            {secretariats.map((s) => (
              <th
                key={s.id}
                className="p-1.5 font-medium text-center border-b border-border min-w-[50px]"
                title={s.code}
              >
                {s.code}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {secretariats.map((from) => (
            <tr key={from.id}>
              <td className="p-1.5 font-medium border-r border-border whitespace-nowrap">
                {from.code}
              </td>
              {secretariats.map((to) => {
                const count = flowMap.get(`${from.id}:${to.id}`) ?? 0
                return (
                  <td
                    key={to.id}
                    className={`p-1.5 text-center border-border ${
                      from.id === to.id ? "bg-muted/50" : getCellColor(count)
                    }`}
                    title={`${from.code} → ${to.code}: ${count}`}
                  >
                    {count > 0 ? count : from.id === to.id ? "—" : ""}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
