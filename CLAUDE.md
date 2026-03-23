# CLAUDE.md — NexoGov

## Nome do Projeto
**NexoGov**

## Slogan
**Conectando processos. Transformando gestão.**

---

## Visão do Produto

O NexoGov é um sistema web institucional de tramitação processual municipal, inspirado em plataformas como **eSAJ** e **PJe**, adaptado à realidade operacional das prefeituras brasileiras.

Permite a **tramitação de protocolos entre secretarias, órgãos e setores**, com rastreabilidade completa, consulta pública controlada, armazenamento seguro de documentos e geração de dados estruturados para gestão e pesquisa acadêmica.

O sistema é um **sistema interno de tramitação administrativa**, com consulta externa restrita. Não é um portal aberto de protocolo pelo cidadão.

---

## Contexto Estratégico

Uso de longo prazo planejado:

- **Faculdade:** desenvolvimento e validação do sistema funcional
- **Mestrado:** melhoria baseada em dados e análise dos fluxos administrativos
- **Doutorado:** consolidação como base de pesquisa aplicada em gestão pública e governo digital

O sistema deve ser construído como **base de dados confiável para pesquisa futura**, além de software operacional.

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 App Router |
| Linguagem | TypeScript strict |
| UI | Tailwind CSS v4 + shadcn/ui |
| Backend | Next.js Route Handlers + Server Components |
| Banco | PostgreSQL (Railway) |
| ORM | Prisma v7 com `@prisma/adapter-pg` |
| Auth | Auth.js v5 (next-auth beta) |
| Validação | Zod v4 |
| Storage | Cloudinary |
| Deploy | Railway |
| Charts | Recharts v3 |
| Notificações | Sonner |

### Detalhe crítico do Prisma
O projeto usa **adapter-based connection** — a URL do banco **não fica no `schema.prisma`**, fica no `prisma.config.ts` via `@prisma/adapter-pg`. Nunca adicionar `datasource db { url = ... }` no schema.

### Detalhe crítico do Auth.js
Auth.js v5 usa split de edge/node. O arquivo `lib/auth/auth.config.ts` contém a config base (compatível com edge), e `lib/auth/auth.ts` contém a instância completa com o adapter Prisma (apenas Node.js).

---

## Ambiente de Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar desenvolvimento
npm run dev

# Type-check
npx tsc --noEmit

# Build de produção
npm run build

# Aplicar schema no banco
npx prisma db push

# Seed do banco (local ou com DATABASE_URL do Railway)
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

### Variáveis de ambiente (`.env`)
```
DATABASE_URL=
AUTH_SECRET=
AUTH_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## Deploy (Railway)

O projeto roda no Railway com deploy automático via push no branch `main` do GitHub.

- **App:** Next.js em container Railway
- **Banco:** PostgreSQL gerenciado pelo Railway (mesmo projeto)
- **Storage:** Cloudinary (externo)
- Para aplicar mudanças de schema em produção: `DATABASE_URL=<url_publica_railway> npx prisma db push`
- A URL pública do Railway está em: Railway Dashboard → PostgreSQL → Connect → Public URL
- O hostname `postgres.railway.internal` só funciona de dentro dos containers Railway — use sempre a URL pública para rodar comandos localmente

---

## Arquitetura

Aplicação monolítica Next.js full-stack. Separação obrigatória:

```
/app              → páginas, layouts, rotas (App Router)
/components       → componentes de interface
/services         → regras de negócio (Prisma chamado aqui)
/lib              → auth, prisma, storage, utils, audit, rate-limit
/validators       → schemas Zod
/prisma           → schema.prisma e seed.ts
```

**Regra crítica:** nunca colocar regra de negócio complexa diretamente em componentes ou route handlers. Regras vão em `/services`.

---

## Domínio de Negócio

### Estrutura organizacional
- **Secretaria** → unidade principal
- **Órgão** → subdivisão da secretaria
- **Setor** → subdivisão do órgão ou da secretaria

### Perfis de usuário (UserRole)
```
ADMIN_SISTEMA    → acesso total ao sistema
DEV              → acesso total + ferramentas de debug
PREFEITO         → acesso gerencial amplo
VICE_PREFEITO    → acesso gerencial amplo
SECRETARIO       → acesso gerencial da secretaria
GESTOR           → acesso operacional gerencial
SERVIDOR_PUBLICO → criação e tramitação de protocolos
CONSELHEIRO      → acesso de leitura
```
Perfis legados (manter compatibilidade): `ADMIN`, `PROTOCOLO`, `OPERADOR_SETOR`

### Hierarquia de permissões (`lib/permissions/index.ts`)
```ts
ADMIN_ROLES   = { ADMIN_SISTEMA, DEV, ADMIN }
MANAGER_ROLES = ADMIN_ROLES + { GESTOR, PREFEITO, VICE_PREFEITO, SECRETARIO }
CREATOR_ROLES = MANAGER_ROLES + { SERVIDOR_PUBLICO, PROTOCOLO }
```

---

## Entidades Principais

### Protocol
- `number` → gerado automaticamente no formato `ANO.SEQUENCIAL` (ex: `2026.000001`)
- `passwordHash` → bcrypt da senha do protocolo (necessária para acesso a documentos)
- `requesters` → campo `Json` para múltiplos interessados `[{name, document, company}]`
- `deadlineAt` → prazo; vencidos ficam destacados em vermelho na listagem
- `status` → OPEN | IN_PROGRESS | PENDING | DEFERRED | CLOSED | ARCHIVED

### Movement (Movimentação)
- Imutável após criação
- `isInterSecretariat` → flag para fluxos entre secretarias (usado nos dashboards)
- CC (cópia): movimentações com prefixo `[CÓPIA]` não alteram localização atual do protocolo

### Document
- `visibility` → INTERNAL | RESTRICTED_BY_PROTOCOL_PASSWORD
- Acesso restrito exige número do protocolo + senha
- Todo acesso gera `DocumentAccessLog`

---

## Fluxo Principal

1. Usuário interno cria protocolo (com senha e documentos opcionais)
2. Sistema gera número único `ANO.SEQUENCIAL`
3. Protocolo entra na estrutura de origem
4. Tramitação entre secretarias/setores via encaminhamentos
5. Cada encaminhamento gera movimentação imutável
6. Documentos podem ser juntados a qualquer momento (múltiplos por vez)
7. Usuário externo consulta andamento pelo número
8. Acesso a documentos exige número + senha do protocolo
9. Todo acesso relevante gera log de auditoria

---

## Rate Limiting

Implementado em `lib/rate-limit.ts` (in-memory). Em produção com múltiplas instâncias, substituir por Redis.

- Consulta pública de protocolo: **30 req/min por IP**
- Acesso a documentos (senha): **10 req/min por IP**

---

## Segurança

- Senhas de usuário: mínimo 8 caracteres, maiúscula, número e caractere especial
- Senha do protocolo: mínimo 4 caracteres (gerador de 256 bits disponível no formulário)
- Rotas internas protegidas por Auth.js middleware
- Logs de auditoria obrigatórios em toda ação relevante
- Documentos nunca expostos sem autenticação específica do protocolo

---

## Páginas e Rotas Principais

### Internas (`/(internal)`)
| Rota | Descrição |
|---|---|
| `/dashboard` | KPIs, gráficos, fluxos, atividade recente |
| `/protocols` | Listagem com filtros, busca, paginação |
| `/protocols/novo` | Criação de protocolo |
| `/protocols/[id]` | Detalhe, timeline, documentos, ações |
| `/protocols/[id]/print` | Página de impressão |
| `/secretariats` | Gestão de secretarias |
| `/organs` | Gestão de órgãos |
| `/sectors` | Gestão de setores |
| `/users` | Gestão de usuários |
| `/audit` | Logs de auditoria paginados |
| `/metrics` | Métricas avançadas |
| `/reports` | Relatórios |
| `/profile` | Perfil do usuário |

### Públicas (`/(public)`)
| Rota | Descrição |
|---|---|
| `/consulta` | Consulta por número de protocolo |
| `/consulta/documentos` | Acesso a documentos com número + senha |

### API relevante
| Endpoint | Descrição |
|---|---|
| `GET /api/export?entity=...` | Export CSV para análise acadêmica (admin) |
| `POST /api/protocols/[id]/forward` | Encaminhar protocolo (com CC) |
| `PATCH /api/protocols/[id]/status` | Alterar status |
| `POST /api/documents` | Upload de documento |
| `GET /api/public/protocols/[number]` | Consulta pública |
| `POST /api/public/documents` | Acesso a documentos com senha |

---

## Dashboard

- KPIs: total, em tramitação, pendentes, encerrados, atrasados
- Gráfico de status (BarChart)
- Distribuição por secretaria
- Fluxos inter-secretaria mais frequentes
- Evolução temporal mensal (LineChart — 12 meses)
- Matriz de fluxos entre secretarias (heatmap)
- Métricas de segurança (tentativas inválidas, atrasados)
- Atividade recente de auditoria

---

## Export para Pesquisa Acadêmica

`GET /api/export?entity=protocols|movements|flows|secretariats` (restrito a admins)

Exporta CSV com BOM (compatível com Excel) de:
- `protocols` → todos os protocolos com metadados
- `movements` → todas as movimentações
- `flows` → agregação de fluxos entre secretarias
- `secretariats` → secretarias com contagens

Aceita parâmetros `from` e `to` (ISO date) para `protocols` e `movements`.

---

## Convenções de Código

- Todos os identificadores em **inglês** (variáveis, funções, tipos, rotas de API, campos do banco)
- Textos da interface em **português brasileiro**
- Sem comentários desnecessários — código deve ser autoexplicativo
- Sem over-engineering: construir apenas o necessário para o estágio atual
- Sem feature flags, backwards-compat shims ou mocks em testes

---

## Instrução Final

Ao trabalhar neste projeto:
- Preservar consistência entre schema Prisma, services e interface
- Nunca colocar regra de negócio em componentes ou route handlers diretamente
- Tratar o NexoGov como sistema crítico e institucional
- Considerar sempre o valor futuro dos dados para pesquisa acadêmica
- Começar pela solução mais sólida e direta viável para o estágio atual
