import { PrismaClient, UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting NexoGov seed...")

  // ─── Secretariats ──────────────────────────────────────────────────────────
  const secretariats = await Promise.all([
    // MVP Phase 1
    prisma.secretariat.upsert({
      where: { code: "SEDAG" },
      update: {},
      create: {
        name: "Secretaria Municipal de Desenvolvimento Agrário, Pesca e Meio Ambiente",
        code: "SEDAG",
        description: "Responsável por políticas de desenvolvimento agrário, pesca e preservação ambiental.",
      },
    }),
    prisma.secretariat.upsert({
      where: { code: "SEGGDE" },
      update: {},
      create: {
        name: "Secretaria Municipal de Governo, Gestão e Desenvolvimento Econômico",
        code: "SEGGDE",
        description: "Responsável pela gestão governamental e fomento ao desenvolvimento econômico.",
      },
    }),
    prisma.secretariat.upsert({
      where: { code: "STCEJ" },
      update: {},
      create: {
        name: "Secretaria Municipal de Turismo, Cultura, Esporte e Juventude",
        code: "STCEJ",
        description: "Responsável por políticas de turismo, cultura, esporte e juventude.",
      },
    }),
    prisma.secretariat.upsert({
      where: { code: "SEPS" },
      update: {},
      create: {
        name: "Secretaria de Proteção Social",
        code: "SEPS",
        description: "Responsável por programas e políticas de assistência e proteção social.",
      },
    }),
    prisma.secretariat.upsert({
      where: { code: "GABPREF" },
      update: {},
      create: {
        name: "Gabinete do Prefeito",
        code: "GABPREF",
        description: "Gabinete do Prefeito Municipal.",
      },
    }),
    // Expansion secretariats (can be activated later)
    prisma.secretariat.upsert({
      where: { code: "SEMED" },
      update: {},
      create: {
        name: "Secretaria Municipal de Educação",
        code: "SEMED",
        description: "Responsável pela política municipal de educação.",
        active: false,
      },
    }),
    prisma.secretariat.upsert({
      where: { code: "SEMFIN" },
      update: {},
      create: {
        name: "Secretaria Municipal de Finanças",
        code: "SEMFIN",
        description: "Responsável pela gestão financeira do município.",
        active: false,
      },
    }),
    prisma.secretariat.upsert({
      where: { code: "SEMINF" },
      update: {},
      create: {
        name: "Secretaria Municipal de Infraestrutura",
        code: "SEMINF",
        description: "Responsável pelas obras e infraestrutura municipal.",
        active: false,
      },
    }),
    prisma.secretariat.upsert({
      where: { code: "SEMOP" },
      update: {},
      create: {
        name: "Secretaria Municipal de Orçamento e Planejamento",
        code: "SEMOP",
        description: "Responsável pelo planejamento orçamentário municipal.",
        active: false,
      },
    }),
    prisma.secretariat.upsert({
      where: { code: "SEMSAUDE" },
      update: {},
      create: {
        name: "Secretaria Municipal de Saúde",
        code: "SEMSAUDE",
        description: "Responsável pela política municipal de saúde.",
        active: false,
      },
    }),
    prisma.secretariat.upsert({
      where: { code: "CGM" },
      update: {},
      create: {
        name: "Controladoria Geral do Município",
        code: "CGM",
        description: "Órgão de controle interno e transparência.",
        active: false,
      },
    }),
    prisma.secretariat.upsert({
      where: { code: "PGM" },
      update: {},
      create: {
        name: "Procuradoria Geral do Município",
        code: "PGM",
        description: "Responsável pela representação jurídica do município.",
        active: false,
      },
    }),
  ])

  console.log(`✅ ${secretariats.length} secretariats seeded`)

  // ─── Sectors (within SEGGDE as example) ───────────────────────────────────
  const seggde = secretariats.find((s) => s.code === "SEGGDE")!
  const gabpref = secretariats.find((s) => s.code === "GABPREF")!

  const sectors = await Promise.all([
    prisma.sector.upsert({
      where: { code: "PROT_SEGGDE" },
      update: {},
      create: {
        name: "Setor de Protocolo",
        code: "PROT_SEGGDE",
        description: "Responsável pelo recebimento e registro de protocolos.",
        secretariatId: seggde.id,
      },
    }),
    prisma.sector.upsert({
      where: { code: "ADM_SEGGDE" },
      update: {},
      create: {
        name: "Setor Administrativo",
        code: "ADM_SEGGDE",
        description: "Responsável pelos processos administrativos internos.",
        secretariatId: seggde.id,
      },
    }),
    prisma.sector.upsert({
      where: { code: "GABINETE" },
      update: {},
      create: {
        name: "Gabinete",
        code: "GABINETE",
        description: "Gabinete direto do prefeito.",
        secretariatId: gabpref.id,
      },
    }),
  ])

  console.log(`✅ ${sectors.length} sectors seeded`)

  // ─── Protocol Sequence ─────────────────────────────────────────────────────
  const currentYear = new Date().getFullYear()
  await prisma.protocolSequence.upsert({
    where: { year: currentYear },
    update: {},
    create: {
      year: currentYear,
      lastSequence: 0,
    },
  })

  console.log(`✅ Protocol sequence for ${currentYear} initialized`)

  // ─── Admin User ────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("nexogov@admin2026", 12)
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@nexogov.gov.br" },
    update: {},
    create: {
      name: "Administrador do Sistema",
      email: "admin@nexogov.gov.br",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      secretariatId: gabpref.id,
      active: true,
    },
  })

  console.log(`✅ Admin user: ${adminUser.email}`)

  // ─── Gestor User ───────────────────────────────────────────────────────────
  const gestorPassword = await bcrypt.hash("nexogov@gestor2026", 12)
  const gestorUser = await prisma.user.upsert({
    where: { email: "gestor@nexogov.gov.br" },
    update: {},
    create: {
      name: "Gestor de Processos",
      email: "gestor@nexogov.gov.br",
      passwordHash: gestorPassword,
      role: UserRole.GESTOR,
      secretariatId: seggde.id,
      active: true,
    },
  })

  console.log(`✅ Gestor user: ${gestorUser.email}`)

  // ─── Protocolo User ────────────────────────────────────────────────────────
  const protocoloPassword = await bcrypt.hash("nexogov@protocolo2026", 12)
  const protocoloUser = await prisma.user.upsert({
    where: { email: "protocolo@nexogov.gov.br" },
    update: {},
    create: {
      name: "Servidor de Protocolo",
      email: "protocolo@nexogov.gov.br",
      passwordHash: protocoloPassword,
      role: UserRole.PROTOCOLO,
      secretariatId: seggde.id,
      sectorId: sectors.find((s) => s.code === "PROT_SEGGDE")!.id,
      active: true,
    },
  })

  console.log(`✅ Protocolo user: ${protocoloUser.email}`)

  // ─── Sample Protocol ───────────────────────────────────────────────────────
  const seqRecord = await prisma.protocolSequence.update({
    where: { year: currentYear },
    data: { lastSequence: { increment: 1 } },
  })

  const protocolNumber = `${currentYear}.${String(seqRecord.lastSequence).padStart(6, "0")}`
  const protocolPassword = await bcrypt.hash("prot1234", 10)

  const existingProtocol = await prisma.protocol.findUnique({
    where: { number: protocolNumber },
  })

  if (!existingProtocol) {
    const protocol = await prisma.protocol.create({
      data: {
        number: protocolNumber,
        year: currentYear,
        sequence: seqRecord.lastSequence,
        passwordHash: protocolPassword,
        title: "Solicitação de Aprovação de Projeto de Turismo Rural",
        description:
          "Solicitação de análise e aprovação de proposta para implementação de rota de turismo rural no município, vinculada ao Programa de Desenvolvimento do Turismo Sustentável.",
        type: "ADMINISTRATIVE",
        status: "IN_PROGRESS",
        priority: "NORMAL",
        requesterName: "Associação de Produtores Rurais do Vale",
        internalNotes: "Verificar alinhamento com o plano diretor municipal.",
        originSecretariatId: seggde.id,
        originSectorId: sectors.find((s) => s.code === "PROT_SEGGDE")!.id,
        currentSecretariatId: secretariats.find((s) => s.code === "STCEJ")!.id,
        createdById: protocoloUser.id,
      },
    })

    // Initial movement — creation
    await prisma.movement.create({
      data: {
        protocolId: protocol.id,
        type: "CREATION",
        description: "Protocolo recebido e registrado no sistema.",
        fromSecretariatId: seggde.id,
        fromSectorId: sectors.find((s) => s.code === "PROT_SEGGDE")!.id,
        performedById: protocoloUser.id,
      },
    })

    // Forwarding movement
    await prisma.movement.create({
      data: {
        protocolId: protocol.id,
        type: "FORWARDING",
        description:
          "Processo encaminhado à Secretaria de Turismo para análise de viabilidade técnica.",
        fromSecretariatId: seggde.id,
        fromSectorId: sectors.find((s) => s.code === "PROT_SEGGDE")!.id,
        toSecretariatId: secretariats.find((s) => s.code === "STCEJ")!.id,
        isInterSecretariat: true,
        performedById: protocoloUser.id,
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "PROTOCOL_CREATED",
        userId: protocoloUser.id,
        secretariatId: seggde.id,
        entityType: "Protocol",
        entityId: protocol.id,
        metadata: { number: protocolNumber },
        ip: "127.0.0.1",
        userAgent: "seed",
      },
    })

    console.log(`✅ Sample protocol created: ${protocolNumber}`)
    console.log(`   Protocol password: prot1234`)
  }

  console.log("\n🎉 Seed completed successfully!")
  console.log("\n📋 Default credentials:")
  console.log("   Admin:     admin@nexogov.gov.br / nexogov@admin2026")
  console.log("   Gestor:    gestor@nexogov.gov.br / nexogov@gestor2026")
  console.log("   Protocolo: protocolo@nexogov.gov.br / nexogov@protocolo2026")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
