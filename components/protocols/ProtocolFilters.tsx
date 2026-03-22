"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

interface Secretariat {
  id: string
  name: string
  code: string
}

interface ProtocolFiltersProps {
  secretariats: Secretariat[]
}

export function ProtocolFilters({ secretariats }: ProtocolFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(searchParams.get("search") ?? "")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== "all") {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const hasFilters =
    searchParams.has("search") ||
    searchParams.has("status") ||
    searchParams.has("type") ||
    searchParams.has("priority") ||
    searchParams.has("secretariatId")

  return (
    <div className="flex flex-wrap gap-2 flex-1">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar por número, título..."
          className="pl-8 w-64 h-8 text-sm"
          value={searchValue}
          onChange={(e) => {
            const value = e.target.value
            setSearchValue(value)
            if (debounceRef.current) clearTimeout(debounceRef.current)
            debounceRef.current = setTimeout(() => {
              const params = new URLSearchParams(searchParams.toString())
              if (value) params.set("search", value)
              else params.delete("search")
              params.delete("page")
              router.push(`${pathname}?${params.toString()}`)
            }, 400)
          }}
        />
      </div>

      <Select
        value={searchParams.get("status") ?? "all"}
        onValueChange={(v) => updateFilter("status", v)}
      >
        <SelectTrigger className="w-40 h-8 text-sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="OPEN">Aberto</SelectItem>
          <SelectItem value="IN_PROGRESS">Em Tramitação</SelectItem>
          <SelectItem value="PENDING">Pendente</SelectItem>
          <SelectItem value="DEFERRED">Deferido</SelectItem>
          <SelectItem value="CLOSED">Encerrado</SelectItem>
          <SelectItem value="ARCHIVED">Arquivado</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("type") ?? "all"}
        onValueChange={(v) => updateFilter("type", v)}
      >
        <SelectTrigger className="w-40 h-8 text-sm">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          <SelectItem value="ADMINISTRATIVE">Administrativo</SelectItem>
          <SelectItem value="FINANCIAL">Financeiro</SelectItem>
          <SelectItem value="LEGAL">Jurídico</SelectItem>
          <SelectItem value="TECHNICAL">Técnico</SelectItem>
          <SelectItem value="HUMAN_RESOURCES">Recursos Humanos</SelectItem>
          <SelectItem value="SOCIAL">Social</SelectItem>
          <SelectItem value="ENVIRONMENTAL">Ambiental</SelectItem>
        </SelectContent>
      </Select>

      {secretariats.length > 0 && (
        <Select
          value={searchParams.get("secretariatId") ?? "all"}
          onValueChange={(v) => updateFilter("secretariatId", v)}
        >
          <SelectTrigger className="w-52 h-8 text-sm">
            <SelectValue placeholder="Secretaria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as secretarias</SelectItem>
            {secretariats.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.code} — {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-muted-foreground"
          onClick={() => router.push(pathname)}
        >
          <X className="h-3.5 w-3.5" />
          Limpar filtros
        </Button>
      )}
    </div>
  )
}
