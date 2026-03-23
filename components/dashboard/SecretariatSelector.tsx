"use client"

import { useRouter, usePathname } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SecretariatOption {
  id: string
  name: string
  code: string
}

interface SecretariatSelectorProps {
  secretariats: SecretariatOption[]
  selectedId?: string
}

export function SecretariatSelector({ secretariats, selectedId }: SecretariatSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()

  function handleChange(id: string) {
    router.push(`${pathname}?tab=secretaria&sid=${id}`)
  }

  return (
    <Select value={selectedId ?? ""} onValueChange={handleChange}>
      <SelectTrigger className="w-72">
        <SelectValue placeholder="Selecione uma secretaria..." />
      </SelectTrigger>
      <SelectContent>
        {secretariats.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.code} — {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
