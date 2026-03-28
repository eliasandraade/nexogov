import { auth } from "@/lib/auth/auth"
import { completeOnboarding, resetOnboarding } from "@/services/onboarding.service"
import { NextResponse } from "next/server"

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const completed = Boolean(body.completed)

  if (completed) {
    await completeOnboarding(session.user.id)
  } else {
    await resetOnboarding(session.user.id)
  }

  return NextResponse.json({ ok: true })
}
