# NexoGov

**Conectando processos. Transformando gestão.**

Sistema web institucional de tramitação processual municipal. Permite o registro, encaminhamento e rastreamento de protocolos administrativos entre secretarias, órgãos e setores de uma prefeitura — com consulta pública, documentos controlados por senha e painel gerencial orientado a dados.

---

## Funcionalidades

- Criação e tramitação de protocolos entre secretarias e setores
- Geração automática de número único (`ANO.SEQUENCIAL`)
- Timeline imutável de movimentações
- Encaminhamento com cópia (CC) para múltiplas secretarias
- Upload de múltiplos documentos com controle de visibilidade
- Consulta pública por número de protocolo
- Acesso a documentos protegido por senha do protocolo
- Dashboard gerencial com gráficos e matriz de fluxos
- Logs de auditoria completos
- Exportação de dados em CSV para análise acadêmica
- Interface responsiva (desktop e mobile)

---

## Stack

- **Next.js 16** App Router · TypeScript strict
- **Prisma 7** com `@prisma/adapter-pg` (adapter-based, sem URL no schema)
- **Auth.js v5** (next-auth beta) com split edge/node
- **Tailwind CSS v4** + shadcn/ui
- **Zod v4** para validação
- **Recharts v3** para gráficos
- **Cloudinary** para armazenamento de arquivos
- **Railway** para hospedagem (app + PostgreSQL)

---

## Desenvolvimento local

### Pré-requisitos
- Node.js 20+
- PostgreSQL local ou acesso ao banco do Railway

### Instalação

```bash
git clone https://github.com/eliasandraade/nexogov.git
cd nexogov
npm install
```

### Variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
DATABASE_URL=postgresql://user:password@host:5432/nexogov

AUTH_SECRET=sua_chave_secreta_aqui
AUTH_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Banco de dados

```bash
# Aplicar schema
npx prisma db push

# Popular com dados iniciais
npx prisma db seed
```

O seed cria um admin padrão. Verifique `prisma/seed.ts` para as credenciais iniciais.

### Rodar

```bash
npm run dev
```

Acesse `http://localhost:3000`.

---

## Deploy

O projeto está hospedado no **Railway** com deploy automático a partir do branch `main`.

Para aplicar mudanças de schema em produção:

```bash
DATABASE_URL=<url_railway> npx prisma db push
```

---

## Estrutura de pastas

```
/app
  /(auth)         → login
  /(internal)     → área autenticada (protocolos, dashboard, etc.)
  /(public)       → consulta pública
  /api            → route handlers

/components
  /layout         → sidebar, topbar, breadcrumbs
  /protocols      → listagem, filtros, botões de ação
  /dashboard      → charts
  /documents      → upload
  /timeline       → histórico de movimentações
  /forms          → formulários de criação
  /ui             → componentes base (shadcn)

/services         → regras de negócio
/repositories     → acesso ao banco
/validators       → schemas Zod
/lib              → auth, prisma, storage, audit, rate-limit, utils
/prisma           → schema.prisma e seed.ts
```

---

## Perfis de acesso

| Perfil | Descrição |
|---|---|
| `ADMIN_SISTEMA` | Acesso total |
| `DEV` | Acesso total |
| `PREFEITO` / `VICE_PREFEITO` | Acesso gerencial amplo |
| `SECRETARIO` | Acesso gerencial da secretaria |
| `GESTOR` | Operacional gerencial |
| `SERVIDOR_PUBLICO` | Criação e tramitação |
| `CONSELHEIRO` | Somente leitura |

---

## Consulta pública

Qualquer pessoa pode consultar o andamento de um protocolo em `/consulta` informando o número. Para acessar documentos, é necessário também a senha do protocolo.

---

## Exportação de dados

O endpoint `GET /api/export` (restrito a admins) exporta CSV para análise acadêmica:

```
/api/export?entity=protocols
/api/export?entity=movements&from=2026-01-01&to=2026-12-31
/api/export?entity=flows
/api/export?entity=secretariats
```

---

## Licença

Uso interno. Desenvolvido para gestão administrativa municipal.
