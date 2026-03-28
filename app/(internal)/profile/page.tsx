import { Topbar } from "@/components/layout/Topbar"
import { auth } from "@/lib/auth/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { USER_ROLE_LABELS } from "@/lib/utils/labels"
import { formatDate } from "@/lib/utils/format"
import { ProfileForm } from "@/components/profile/ProfileForm"
import { RestartOnboardingButton } from "@/components/profile/RestartOnboardingButton"
import { User, Building2, Calendar, BookOpen } from "lucide-react"

export default async function ProfilePage() {
  const session = await auth()
  if (!session) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
      secretariat: { select: { name: true, code: true } },
      organ: { select: { name: true } },
      sector: { select: { name: true } },
    },
  })

  if (!user) redirect("/login")

  return (
    <div>
      <Topbar title="Meu Perfil" subtitle="Dados da conta e configurações" />
      <div className="p-6 space-y-6 max-w-2xl">

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              Informações da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Nome</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">E-mail</p>
                <p>{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Perfil</p>
                <Badge variant="outline">{USER_ROLE_LABELS[user.role]}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Status</p>
                <Badge variant={user.active ? "success" : "secondary"}>
                  {user.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>

            {(user.secretariat || user.organ || user.sector) && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {user.secretariat && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Secretaria</p>
                      <p className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        {user.secretariat.code} — {user.secretariat.name}
                      </p>
                    </div>
                  )}
                  {user.organ && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Órgão</p>
                      <p>{user.organ.name}</p>
                    </div>
                  )}
                  {user.sector && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Setor</p>
                      <p>{user.sector.name}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            <Separator />
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Conta criada em {formatDate(user.createdAt, true)}
            </div>
          </CardContent>
        </Card>

        <ProfileForm />

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Tutorial do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Reveja o tutorial de introdução ao NexoGov a qualquer momento.
            </p>
            <RestartOnboardingButton />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
