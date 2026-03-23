"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, Loader2, FileText } from "lucide-react"
import { PROTOCOL_STATUS_LABELS, PROTOCOL_STATUS_VARIANTS } from "@/lib/utils/labels"
import { Badge } from "@/components/ui/badge"

interface Result {
  id: string
  number: string
  title: string
  status: string
  currentSecretariat: { code: string } | null
}

export function GlobalSearch() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
      if (e.key === "Escape") {
        setOpen(false)
        inputRef.current?.blur()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setLoading(false); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data)
    } finally {
      setLoading(false)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    setActiveIdx(-1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  function navigate(id: string) {
    router.push(`/protocols/${id}`)
    setOpen(false)
    setQuery("")
    setResults([])
    inputRef.current?.blur()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)) }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)) }
    if (e.key === "Enter" && activeIdx >= 0 && results[activeIdx]) navigate(results[activeIdx].id)
  }

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        {loading
          ? <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground animate-spin" />
          : <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50 font-mono hidden lg:flex items-center gap-0.5 pointer-events-none">⌘K</kbd>
        }
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar protocolo..."
          className="h-8 w-48 lg:w-64 pl-8 pr-8 text-sm bg-muted/60 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-background transition-all placeholder:text-muted-foreground/60"
        />
      </div>

      {open && (query.length >= 2) && (
        <div className="absolute top-full mt-1.5 right-0 w-80 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
          {results.length === 0 && !loading ? (
            <p className="text-sm text-muted-foreground px-4 py-3">Nenhum resultado para &quot;{query}&quot;</p>
          ) : (
            <ul>
              {results.map((r, i) => (
                <li key={r.id}>
                  <button
                    onClick={() => navigate(r.id)}
                    className={`w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-muted/50 transition-colors ${i === activeIdx ? "bg-muted/50" : ""}`}
                  >
                    <FileText className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-primary">{r.number}</span>
                        <Badge variant={(PROTOCOL_STATUS_VARIANTS[r.status] ?? "outline") as any} className="text-[10px] px-1.5 py-0">
                          {PROTOCOL_STATUS_LABELS[r.status] ?? r.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground truncate mt-0.5">{r.title}</p>
                      {r.currentSecretariat && (
                        <p className="text-[10px] text-muted-foreground">{r.currentSecretariat.code}</p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
