"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatRelativeTime } from "@/lib/utils/format"
import { Loader2, Send, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Comment {
  id: string
  body: string
  createdAt: string
  author: { id: string; name: string }
}

interface CommentsSectionProps {
  protocolId: string
  currentUserId: string
  currentUserRole: string
}

export function CommentsSection({ protocolId, currentUserId, currentUserRole }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  async function loadComments() {
    try {
      const res = await fetch(`/api/protocols/${protocolId}/comments`)
      const data = await res.json()
      setComments(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadComments() }, [protocolId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/protocols/${protocolId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error("Erro ao enviar comentário."); return }
      setComments(prev => [...prev, data])
      setBody("")
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm("Excluir comentário?")) return
    await fetch(`/api/protocols/${protocolId}/comments/${commentId}`, { method: "DELETE" })
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  const canDelete = (comment: Comment) =>
    comment.author.id === currentUserId || ["ADMIN_SISTEMA", "DEV", "ADMIN"].includes(currentUserRole)

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">Nenhum comentário ainda. Seja o primeiro.</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {comments.map(c => (
            <div key={c.id} className={`flex gap-2.5 group ${c.author.id === currentUserId ? "flex-row-reverse" : ""}`}>
              <div className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${c.author.id === currentUserId ? "bg-primary" : "bg-muted-foreground/40"}`}>
                {c.author.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div className={`max-w-[75%] ${c.author.id === currentUserId ? "items-end" : "items-start"} flex flex-col`}>
                <div className={`rounded-xl px-3 py-2 text-sm ${c.author.id === currentUserId ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"}`}>
                  {c.body}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{c.author.name} · {formatRelativeTime(new Date(c.createdAt))}</span>
                  {canDelete(c) && (
                    <button onClick={() => handleDelete(c.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/50 hover:text-destructive">
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e as unknown as React.FormEvent) } }}
          placeholder="Escreva um comentário interno... (Enter para enviar)"
          className="min-h-[60px] text-sm resize-none"
          disabled={submitting}
        />
        <Button type="submit" size="icon" className="h-10 w-10 flex-shrink-0 self-end" disabled={!body.trim() || submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  )
}
