# Registro de testes

Índice do que existe, onde mora o código de cada teste, e o que ainda falta.
Não é o lugar do teste em si — testes ficam colocados junto do código que
testam (`GATES.md` e `CLAUDE.md`); este arquivo só registra o que existe e
aponta o caminho.

Atualizar a cada fase que adiciona ou remove suíte.

---

## Unitários

| Suíte | Onde | Cobre | Cenários |
|---|---|---|---|
| XP rules (reducer) | `frontend/src/features/kanban/xpRules.spec.ts` | `applyAction`/`applyActions`, tabela de níveis, invariantes, pureza do reducer | 55 — 37 cenários de `xp-rules.json` + 11 de tabela de nível + 5 invariantes + 1 de pureza |
| Auth service | `backend/src/test/java/.../service/AuthServiceTest.java` | Register (grava `user_stats`, envia verificação), login (mensagem igual para e-mail inexistente e senha errada), rate limit bloqueia antes do banco, reset de senha revoga todas as sessões | 6 |
| Auth controller (slice) | `backend/src/test/java/.../controller/AuthControllerTest.java` | Roteamento, validação de request, mapeamento de erro (401/400/204) — sem filtros de segurança | 4 |

Rodar frontend: `cd frontend && npm run test` (ou `npm run test:report` para
gerar `reports/verificacao.md`).
Rodar backend: `cd backend && ./mvnw test` (relatório Surefire em
`backend/target/surefire-reports/` — ainda não incorporado ao
`reports/verificacao.md`, que hoje só cobre o Vitest; ver nota abaixo).

**Planejado, ainda não existe:**

- `XpRulesTableTest` (JUnit) — mesma tabela `xp-rules.json`, contra o
  service Java. Entra quando a Fase 3 tiver um `XpService`.
- Testes de service isolados (`CardServiceTest`, `GoalServiceTest`, ...) à
  medida que a Fase 3 cria os services.

**Débito:** `frontend/scripts/report.mjs` só lê o resultado do Vitest.
`reports/verificacao.md` não reflete o resultado do Surefire — rodar
`./mvnw test` separadamente até isso ser unificado.

## Integração

**Planejado, ainda não existe — tudo Fase 3/4:**

| Suíte | Cobre | Onde vai morar |
|---|---|---|
| `PhaseGatesIT$Idempotencia` | 10 requisições concorrentes com a mesma `Idempotency-Key` gravam 1 evento | `backend/src/test/java/.../integration/` |
| `PhaseGatesIT$Isolamento` | Recurso de outro usuário devolve 404, não 403 | idem |
| `PhaseGatesIT$Ordenacao` | `/move` altera 1 linha; rebalanceamento de `position` | idem |
| `PhaseGatesIT$Foco` | Uma sessão de foco ativa por usuário; XP vem do relógio do servidor | idem |
| `PhaseGatesIT$Ledger` | `user_stats.xp_total` bate com `SUM(delta)` de `xp_events` | idem |
| Migration em banco limpo | `V1__initial_schema.sql` aplica e é idempotente | job de CI, `docker run postgres` |
| Frontend ↔ backend (Fase 4) | Retry reusa `Idempotency-Key`; falha de rede reverte UI otimista; `409` no `/move` recarrega o board | `frontend/src/api/modules/*.spec.ts` (mock de `fetch`) |

Ver `GATES.md` Fase 3 e Fase 4 para a lista completa de portões que cada
suíte precisa fechar antes do merge.

## Carga

**Planejado, ainda não existe.** Entra depois da Fase 3 (precisa de API real
para ter algo a carregar) e antes da Fase 6 (produção).

Candidatos, a decidir quando chegar a hora:

- `/move` sob concorrência: N usuários simulados arrastando cards ao mesmo
  tempo, checando que `xp_events_idempotency_uidx` nunca deixa passar
  duplicata e que não há deadlock de rebalanceamento de `position`.
- `GET /board` com histórico grande de `xp_events` (o índice
  `xp_events_user_day_idx` é o que sustenta isso).
- Login/rate limit (`GATES.md` 6.4): 20 tentativas seguidas → 429.

Ferramenta ainda não escolhida (candidatos: k6, Gatling — decisão de
produto quando a Fase 3 estiver de pé, não antes).

## Manuais (não automatizáveis)

Fidelidade visual e entrega de e-mail seguem apenas no checklist do
`GATES.md` de cada fase — não duplicar aqui.
