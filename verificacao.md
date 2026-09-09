# Relatório de verificação

Gerado em 2026-09-09T13:26:45.915Z

**Situação: APROVADO** — 54/54 aprovados

---

## Frontend (Vitest)

**54/54 aprovados** · 0.00s

### level table — 11/11

| | Cenário | ms |
|---|---|---|
| ✅ | level 1 requires +0 cumulative XP and is called 'Iniciante' | 2 |
| ✅ | level 2 requires 100 cumulative XP and is called 'Aprendiz' | 0 |
| ✅ | level 3 requires 260 cumulative XP and is called 'Focado' | 0 |
| ✅ | level 4 requires 480 cumulative XP and is called 'Constante' | 0 |
| ✅ | level 5 requires 760 cumulative XP and is called 'Estrategista' | 1 |
| ✅ | level 6 requires 1100 cumulative XP and is called 'Disciplinado' | 0 |
| ✅ | level 7 requires 1500 cumulative XP and is called 'Veterano' | 0 |
| ✅ | level 8 requires 1960 cumulative XP and is called 'Mestre' | 0 |
| ✅ | level 9 requires 2480 cumulative XP and is called 'Lenda' | 0 |
| ✅ | level 10 requires 3060 cumulative XP and is called 'Lenda' | 0 |
| ✅ | level 9 and above stays Lenda | 0 |

### XP rules (table shared with the backend) — 38/38

| | Cenário | ms |
|---|---|---|
| ✅ | the table is not empty and has no duplicate ids | 0 |
| ✅ | card-done-low | 1 |
| ✅ | card-done-medium | 0 |
| ✅ | card-done-high | 0 |
| ✅ | card-undone | 0 |
| ✅ | card-move-not-touching-done | 0 |
| ✅ | card-reorder-same-column | 3 |
| ✅ | card-done-redone | 0 |
| ✅ | clean-day-awarded | 0 |
| ✅ | clean-day-once-per-day | 0 |
| ✅ | clean-day-requires-empty-column | 1 |
| ✅ | clean-day-requires-completion | 2 |
| ✅ | clean-day-card-from-other-column | 0 |
| ✅ | goal-week-done | 0 |
| ✅ | goal-month-done | 0 |
| ✅ | goal-reopen | 0 |
| ✅ | goal-toggle-is-idempotent | 0 |
| ✅ | subtask-done | 0 |
| ✅ | subtask-undone | 0 |
| ✅ | subtask-not-counted-as-completed | 0 |
| ✅ | focus-full-session | 0 |
| ✅ | focus-minimum-award | 0 |
| ✅ | focus-ended-early | 0 |
| ✅ | focus-capped-at-planned | 0 |
| ✅ | focus-abandoned | 0 |
| ✅ | total-never-negative | 0 |
| ✅ | ledger-keeps-real-delta | 0 |
| ✅ | streak-first-day | 0 |
| ✅ | streak-continues | 0 |
| ✅ | streak-resets-after-gap | 0 |
| ✅ | streak-once-per-day | 0 |
| ✅ | streak-not-started-by-reversal | 0 |
| ✅ | streak-shown-zero-after-gap | 0 |
| ✅ | level-up-to-2 | 0 |
| ✅ | level-3-threshold | 0 |
| ✅ | level-drops-on-reversal | 0 |
| ✅ | rank-legend-caps | 0 |
| ✅ | full-day-combined | 0 |

### invariants that hold for every scenario — 5/5

| | Cenário | ms |
|---|---|---|
| ✅ | the displayed total is never negative | 1 |
| ✅ | no event has a zero delta | 2 |
| ✅ | the raw total is always the ledger sum plus the opening balance | 1 |
| ✅ | applying zero actions never emits an event | 7 |
| ✅ | the level is always derivable from the displayed total | 1 |


## Backend (JUnit / Surefire)

_Não executado nesta rodada._
