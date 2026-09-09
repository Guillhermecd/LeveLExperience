# LevelExperience

Kanban pessoal gamificado. Produto próprio — organiza tarefas do dia e metas
de curto/médio prazo, credita XP por conclusão e deriva nível e patente a
partir de um ledger no servidor.

Repositório: https://github.com/Guillhermecd/LeveLExperience

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React + TypeScript + Vite, Ant Design, `dnd-kit` |
| Backend | Java 21, Spring Boot 3, Spring Security (JWT), Flyway |
| Banco | PostgreSQL |
| Infra local | Docker Compose (Postgres + Mailpit) |

Este projeto parte do template BIMD, mas se desvia dele em alguns pontos —
lista completa em [`PLAN.md`](PLAN.md#desvios-do-template-bimd-registrar-no-readme-do-projeto).

## Estrutura do repositório

```text
LevelExperience/
  frontend/                       React/TypeScript/Vite
  backend/                        Java/Spring Boot
  docker-compose.dev.yml          Postgres + Mailpit locais
  V1__initial_schema.sql          Schema Postgres (Flyway)
  xp-rules.json                   Tabela de cenários de XP — fonte única de verdade
  Kanban para tarefas e metas/
    design_handoff_kanban/        Referência visual e comportamental (HTML), não é código de produção
  PLAN.md                         Fases, decisões travadas, arquitetura
  GATES.md                        Portões de aceite por fase
  WORKFLOW.md                     Fluxo de branches e regras de merge
  CLAUDE.md                       Convenções de código e idioma
```

`frontend/` e `backend/` ainda não existem neste commit — nascem na Fase 1 e
na Fase 3, respectivamente. Ver `PLAN.md` para a ordem completa.

## Como o projeto funciona

- **Quadro diário**: quatro colunas (`backlog`, `today`, `doing`, `done`).
  Mover um card para `done` credita XP conforme a prioridade; tirar de `done`
  reverte o mesmo valor. Cada mudança de coluna é uma transição via API — o
  servidor recebe a intenção, nunca o estado final do quadro inteiro.
- **XP e nível**: XP é um ledger append-only (nunca um contador), derivado
  sempre no servidor. Nível e patente são calculados a partir da soma do
  ledger — o cliente nunca envia valor de XP.
- **Metas**: semanais (+60 XP) e mensais (+120 XP), com estorno ao reabrir.
- **Sessão de foco**: 1 XP por minuto de foco, mínimo 10, com o relógio do
  servidor decidindo o tempo, não o cliente.
- **Bônus de dia limpo**: zerar a coluna `today` credita +50 XP, uma vez por
  dia.

A tabela completa de regras — estado inicial, ação, delta esperado — vive em
[`xp-rules.json`](xp-rules.json) e roda nos testes do frontend (Vitest) e do
backend (JUnit) contra a mesma especificação. Ela nunca é editada para fazer
um teste passar: se o código diverge dela, o código é que está errado.

## Rodando localmente

```sh
# banco e e-mail de desenvolvimento
docker compose -f docker-compose.dev.yml up -d postgres mailpit

# backend
cd backend && cp .env.example .env && ./mvnw spring-boot:run

# frontend
cd frontend && npm install && npm run dev
```

Detalhes de variáveis de ambiente e serviços em
[`PLAN.md`](PLAN.md#serviços-locais-docker).

## Documentação de referência

| Arquivo | Conteúdo |
|---|---|
| [`PLAN.md`](PLAN.md) | Fases de construção, decisões travadas, camadas, serviços Docker |
| [`GATES.md`](GATES.md) | Portão de aceite (automatizado + manual) de cada fase |
| [`WORKFLOW.md`](WORKFLOW.md) | Nomeclatura de branch, ciclo de PR, regras de merge |
| [`CLAUDE.md`](CLAUDE.md) | Convenções de código, idioma e organização por camada |

## Idioma

Código em inglês (pacote, classe, variável, rota, coluna do banco). Interface
e documentação de projeto em português. Regra completa em `CLAUDE.md`.

## Git

Nenhuma integração à `main` sem confirmação explícita — toda fase nasce numa
branch própria e só sobe depois de revisão. Ver `WORKFLOW.md`.
