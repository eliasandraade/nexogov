# CLAUDE.md — NexoGov

## Nome do Projeto
**NexoGov**

## Slogan
**Conectando processos. Transformando gestão.**

---

## Visão do Produto

O NexoGov é um sistema web institucional de tramitação processual municipal, inspirado em plataformas como **eSAJ** e **PJe**, mas adaptado à realidade operacional das prefeituras brasileiras.

O foco do sistema é permitir a **tramitação de protocolos entre secretarias, órgãos e setores**, com rastreabilidade completa, consulta pública controlada, armazenamento seguro de documentos e geração de dados estruturados para gestão e futura pesquisa acadêmica.

O sistema não é, neste momento, um portal aberto de protocolo pelo cidadão.  
Ele é um **sistema interno de tramitação administrativa**, com consulta externa restrita.

---

## Contexto Estratégico

Este projeto terá uso de longo prazo:

- **Faculdade:** desenvolvimento e validação do sistema funcional
- **Mestrado:** melhoria baseada em dados e análise dos fluxos administrativos
- **Doutorado:** consolidação como base de pesquisa aplicada em gestão pública e governo digital

Por isso, o sistema deve ser construído não apenas como software operacional, mas também como **base de dados confiável para pesquisa futura**.

---

## Objetivo do Sistema

- Centralizar protocolos administrativos
- Padronizar a tramitação entre secretarias e setores
- Garantir rastreabilidade institucional
- Permitir acompanhamento semelhante a eSAJ/PJe
- Restringir acesso integral a documentos sensíveis
- Produzir dashboards avançados para gestão
- Gerar base estruturada para análise de gargalos e fluxos operacionais

---

## Regras Fundamentais

1. Cada protocolo possui um número único.
2. Cada protocolo pode tramitar:
   - entre secretarias
   - entre órgãos
   - entre setores
   - dentro da própria secretaria
3. Apenas usuários internos autenticados podem criar e movimentar protocolos.
4. Usuários externos não criam protocolos.
5. Usuários externos podem consultar movimentações pelo número do protocolo.
6. O acesso integral aos documentos exige:
   - número do protocolo
   - senha específica do protocolo
7. Quem possuir apenas o número do protocolo poderá ver:
   - status
   - movimentações
   - localização atual do protocolo
   - metadados públicos
8. O conteúdo integral dos documentos não deve ser exibido sem autenticação específica do protocolo.
9. Todo acesso a documento deve gerar rastreabilidade detalhada.
10. O histórico de movimentações é imutável.
11. Logs de auditoria são obrigatórios.

---

## Escopo Inicial

Embora o sistema seja pensado para a prefeitura inteira, o início real será com **3 ou 4 secretarias principais**.

O escopo inicial é **administrativo simples**, sem rigor jurídico pesado de tribunal, mas com experiência e organização inspiradas em eSAJ/PJe.

---

## Problema que o Sistema Resolve

Prefeituras frequentemente não sabem:

- onde os processos estão travando
- quanto tempo passam parados
- quais setores demandam mais outros setores
- quem acessou documentos
- como melhorar sua gestão com base em dados operacionais reais

O NexoGov existe para transformar esse cenário.

---

## Princípios de Produto

- institucional
- auditável
- confiável
- claro
- simples administrativamente
- preparado para expansão
- orientado a dados

---

## Stack Obrigatória

- **Frontend:** Next.js 14+ App Router
- **Linguagem:** TypeScript strict
- **UI:** Tailwind CSS + shadcn/ui
- **Backend:** Next.js full stack com Server Actions e Route Handlers
- **Banco:** PostgreSQL
- **ORM:** Prisma
- **Auth:** Auth.js v5
- **Validação:** Zod
- **Storage de arquivos:** S3 compatível ou Cloudinary
- **Deploy:** Vercel

---

## Diretrizes de Arquitetura

Aplicação monolítica, organizada e robusta.

Separação obrigatória:

- `/app` → páginas, layouts, rotas
- `/components` → componentes de interface
- `/services` → regras de negócio
- `/repositories` → acesso ao banco
- `/lib` → auth, prisma, storage, utils, audit helpers
- `/types` → tipagens globais
- `/validators` → schemas Zod
- `/hooks` → hooks de UI e client-side

### Regra crítica
Nunca colocar regra de negócio complexa diretamente em componentes visuais.

---

## Estrutura de Pastas Recomendada

/app
  /(auth)
    /login
  /(internal)
    /dashboard
    /protocolos
    /protocolos/novo
    /protocolos/[id]
    /secretarias
    /orgaos
    /setores
    /auditoria
  /(public)
    /consulta
    /consulta/documentos

/components
  /layout
  /dashboard
  /protocolos
  /timeline
  /documentos
  /auditoria
  /forms
  /ui

/lib
  /auth
  /prisma
  /storage
  /audit
  /utils
  /permissions

/services
  protocolo.service.ts
  movimentacao.service.ts
  documento.service.ts
  auditoria.service.ts
  organizacao.service.ts
  dashboard.service.ts

/repositories
  protocolo.repository.ts
  movimentacao.repository.ts
  documento.repository.ts
  auditoria.repository.ts
  organizacao.repository.ts
  dashboard.repository.ts

/validators
  protocolo.validator.ts
  movimentacao.validator.ts
  login.validator.ts
  consulta.validator.ts
  documento.validator.ts

/types

/prisma

---

## Domínio de Negócio

### Estrutura organizacional
O sistema deve representar:

- Secretaria
- Órgão
- Setor

Um protocolo pode ser encaminhado entre quaisquer dessas estruturas, conforme a modelagem institucional escolhida.

### Usuários
Usuários internos pertencem a uma estrutura organizacional e possuem perfil de acesso.

Perfis mínimos:

- `ADMIN`
- `GESTOR`
- `PROTOCOLO`
- `OPERADOR_SETOR`

---

## Entidades Principais

### 1. Protocolo

Campos mínimos esperados:

- id
- numero
- senhaHash
- titulo
- descricao
- tipo
- status
- prioridade opcional
- secretariaOrigemId
- orgaoOrigemId opcional
- setorOrigemId opcional
- secretariaAtualId
- orgaoAtualId opcional
- setorAtualId opcional
- interessadoNome opcional
- interessadoDocumento opcional
- observacoesInternas opcional
- createdById
- createdAt
- updatedAt

### 2. Movimentacao

Campos mínimos:

- id
- protocoloId
- tipo
- descricao
- secretariaOrigemId opcional
- orgaoOrigemId opcional
- setorOrigemId opcional
- secretariaDestinoId opcional
- orgaoDestinoId opcional
- setorDestinoId opcional
- realizadoPorId
- createdAt

Tipos mínimos de movimentação:

- `CRIACAO`
- `ENCAMINHAMENTO`
- `RECEBIMENTO`
- `DESPACHO`
- `PARECER_ADMINISTRATIVO`
- `JUNTADA_DOCUMENTO`
- `ATUALIZACAO_STATUS`
- `FINALIZACAO`

### 3. Documento

Campos mínimos:

- id
- protocoloId
- nomeOriginal
- nomeArmazenado
- storageKey
- url
- mimeType
- tamanho
- hashArquivo opcional
- visibilidade
- uploadedById
- createdAt

Visibilidade inicial:

- `INTERNA`
- `RESTRITA_POR_SENHA_PROTOCOLO`

### 4. Log de Acesso a Documento

Campos mínimos:

- id
- documentoId
- protocoloId
- usuarioId opcional
- tipoAcesso
- origemAcesso
- canalAcesso
- rotaReferencia
- ip
- userAgent
- sucesso
- motivoFalha opcional
- createdAt

Tipos de acesso mínimos:

- `VISUALIZACAO`
- `DOWNLOAD`
- `PREVIEW`
- `TENTATIVA_INVALIDA`

Origens mínimas:

- `INTERNO_AUTENTICADO`
- `EXTERNO_NUMERO_SENHA`
- `EXTERNO_TENTATIVA_INVALIDA`

### 5. Log de Auditoria Geral

Registrar ao menos:

- login
- logout
- criação de protocolo
- atualização de protocolo
- alteração de status
- encaminhamento
- juntada de documento
- visualização de documento
- download de documento
- erro relevante
- tentativa negada

### 6. Usuário

Campos mínimos:

- id
- nome
- email
- senhaHash
- perfil
- secretariaId opcional
- orgaoId opcional
- setorId opcional
- ativo
- createdAt
- updatedAt

### 7. Secretaria
### 8. Órgão
### 9. Setor

Essas entidades devem permitir modelar a estrutura administrativa municipal.

---

## Geração do Número de Protocolo

Formato recomendado:

`ANO.SEQUENCIAL`

Exemplo:
`2026.000001`

Regras:
- único
- incremental por ano
- gerado no backend
- não pode ser editado manualmente

---

## Fluxo Principal do Sistema

1. Usuário interno cria protocolo
2. Sistema gera número único
3. Usuário anexa documentos se necessário
4. Protocolo entra na estrutura inicial
5. Protocolo é encaminhado entre setores/secretarias/órgãos
6. Cada etapa gera movimentação imutável
7. Documentos podem ser juntados ao protocolo
8. Usuário externo consulta andamento pelo número
9. Usuário externo só acessa documentos com número + senha do protocolo
10. Todo acesso relevante gera log

---

## Consulta Pública

### Consulta por número
A página pública deve permitir informar o número do protocolo e exibir:

- número do protocolo
- título
- status
- data de criação
- localização atual
- timeline de movimentações
- metadados públicos

### Consulta de documentos
Para liberar documentos, o sistema deve exigir:

- número do protocolo
- senha do protocolo

Somente após essa validação devem ser exibidos os documentos autorizados.

Toda tentativa e todo acesso devem ser registrados.

---

## Dashboard Avançado

O sistema deve ter painel gerencial com, no mínimo:

- total de protocolos
- protocolos por status
- protocolos por secretaria
- protocolos por setor
- protocolos por período
- protocolos finalizados por período
- tempo médio de tramitação
- tempo médio por secretaria
- tempo médio por setor
- setores com mais pendências
- maiores fluxos entre secretarias e órgãos
- protocolos atrasados
- usuários mais ativos
- eventos recentes de auditoria

---

## Dados para Pesquisa

O sistema deve ser modelado para futura análise acadêmica.

A estrutura de dados deve permitir estudar:

- gargalos operacionais
- trajetórias mais frequentes de protocolos
- padrões de encaminhamento
- tempos médios por órgão e setor
- redes de interação entre secretarias
- concentração de carga operacional
- padrões de atraso
- reencaminhamentos recorrentes

Toda decisão de modelagem deve considerar que o sistema servirá no futuro para:
- produção de artigos
- dissertação
- tese
- proposição de modelo de gestão pública baseada em dados

---

## Segurança

Obrigatório:

- autenticação robusta
- autorização por perfil
- validação com Zod
- hash seguro de senhas
- hash seguro da senha do protocolo
- proteção de rotas internas
- logs de acesso
- sanitização de inputs
- política clara de acesso a documentos

---

## UX/UI

A interface deve ser inspirada em sistemas como eSAJ e PJe, mas com melhor clareza visual.

Características desejadas:

- institucional
- sóbria
- limpa
- forte uso de tabelas
- timeline processual bem destacada
- filtros robustos
- consulta pública clara
- área de documentos bem delimitada
- área de auditoria legível

Evitar:
- visual excessivamente moderno sem contexto institucional
- excesso de cor
- animações desnecessárias

---

## Funcionalidades Obrigatórias no MVP

### Internas
- login
- cadastro organizacional básico
- criação de protocolo
- geração automática de número
- tramitação entre estruturas
- timeline de movimentações
- anexação de documentos
- listagem com filtros
- detalhe do protocolo
- dashboard inicial
- logs de auditoria

### Externas
- consulta pública por número
- validação por número + senha para documentos
- logs de acesso a documentos

---

## Fases de Implementação

### Fase 1
- setup do projeto
- autenticação
- schema Prisma
- entidades organizacionais
- CRUD de protocolo
- geração de número único
- timeline de movimentações
- consulta pública por número

### Fase 2
- upload em nuvem
- senha do protocolo
- restrição de documentos
- logs de acesso a documentos
- dashboard avançado

### Fase 3
- filtros avançados
- relatórios
- melhorias de auditoria
- refinamento visual estilo eSAJ/PJe

---

## O que Não Fazer Agora

- não usar microserviços
- não adicionar IA neste momento
- não transformar em sistema judicial complexo
- não abrir protocolo diretamente pelo cidadão
- não complicar a arquitetura sem necessidade

---

## Mentalidade de Construção

Este sistema deve ser pensado como:

- produto institucional real
- govtech escalável
- base de pesquisa aplicada
- ativo central de longo prazo

Prioridades permanentes:

1. confiabilidade
2. auditabilidade
3. clareza
4. segurança
5. qualidade dos dados
6. manutenção fácil
7. evolução futura

---

## Ordem Recomendada de Trabalho

1. modelar domínio e schema Prisma
2. configurar auth e permissões
3. implementar estrutura organizacional
4. implementar criação e tramitação de protocolos
5. implementar timeline
6. implementar consulta pública
7. implementar storage e documentos
8. implementar rastreabilidade de acesso
9. implementar dashboard e auditoria
10. refinar UX institucional

---

## Instrução Final ao Claude

Ao trabalhar neste projeto:

- preserve consistência entre domínio, banco e interface
- explique decisões estruturais importantes
- escreva código limpo e pronto para evolução
- trate o NexoGov como um sistema crítico e institucional
- pense sempre também no valor futuro dos dados para pesquisa acadêmica

Comece sempre pela solução mais sólida e clara que seja viável para um MVP real.