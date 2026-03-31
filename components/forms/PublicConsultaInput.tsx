"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

export function PublicConsultaInput() {
  const [number, setNumber] = useState("")
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const cleaned = number.trim()
    if (!cleaned) return
    router.push(`/consulta?numero=${encodeURIComponent(cleaned)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        placeholder="Ex: 2026.000001"
        className="flex-1 h-9 px-3 rounded-md text-sm font-mono bg-white/10 border border-white/20 text-white placeholder:text-white/35 focus:outline-none focus:ring-1 focus:ring-white/40 focus:border-white/40 transition-colors"
      />
      <button
        type="submit"
        disabled={!number.trim()}
        className="h-9 px-3.5 rounded-md bg-white/15 hover:bg-white/25 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none transition-all text-white flex items-center gap-1.5 text-xs font-medium"
      >
        <Search className="h-3.5 w-3.5" />
        Consultar
      </button>
    </form>
  )
}
