"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"

export function RestartOnboardingButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleRestart() {
    setLoading(true)
    await fetch("/api/user/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: false }),
    })
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <Button variant="outline" size="sm" onClick={handleRestart} disabled={loading}>
      <BookOpen className="h-4 w-4 mr-2" />
      {loading ? "Aguarde..." : "Rever tutorial"}
    </Button>
  )
}
