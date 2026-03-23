"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Plus, Tag } from "lucide-react"
import { toast } from "sonner"

interface TagsEditorProps {
  protocolId: string
  tags: string[]
  canEdit: boolean
}

export function TagsEditor({ protocolId, tags: initialTags, canEdit }: TagsEditorProps) {
  const router = useRouter()
  const [tags, setTags] = useState(initialTags)
  const [input, setInput] = useState("")
  const [saving, setSaving] = useState(false)

  async function save(newTags: string[]) {
    setSaving(true)
    try {
      const res = await fetch(`/api/protocols/${protocolId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: newTags }),
      })
      if (!res.ok) { toast.error("Erro ao salvar tag."); return }
      setTags(newTags)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  function addTag() {
    const val = input.trim().toLowerCase()
    if (!val || tags.includes(val) || tags.length >= 10) return
    setInput("")
    save([...tags, val])
  }

  function removeTag(tag: string) {
    save(tags.filter(t => t !== tag))
  }

  if (!canEdit && tags.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Tag className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      {tags.map(tag => (
        <Badge key={tag} variant="secondary" className="text-xs gap-1 pr-1">
          {tag}
          {canEdit && (
            <button onClick={() => removeTag(tag)} disabled={saving} className="hover:text-destructive ml-0.5">
              <X className="h-2.5 w-2.5" />
            </button>
          )}
        </Badge>
      ))}
      {canEdit && tags.length < 10 && (
        <div className="flex items-center gap-1">
          <Input
            value={input}
            onChange={e => setInput(e.target.value.toLowerCase())}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
            placeholder="Nova tag..."
            className="h-6 text-xs w-24 px-2"
          />
          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={addTag} disabled={!input.trim() || saving}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
}
