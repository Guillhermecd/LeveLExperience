# Relatório de verificação

Gerado em 2026-09-14T19:53:17.256Z

**Situação: APROVADO** — 94/94 aprovados

---

## Frontend (Vitest)

**61/61 aprovados** · 0.03s

### apiRequest — 6/6

| | Cenário | ms |
|---|---|---|
| ✅ | never sends an Idempotency-Key on a GET request | 16 |
| ✅ | sends a freshly generated Idempotency-Key on a mutating request | 1 |
| ✅ | retries after a 401 with the SAME Idempotency-Key it used on the first attempt | 1 |
| ✅ | does not retry a 401 on auth endpoints (skipAuthRetry) | 1 |
| ✅ | throws ApiError with the parsed message on a non-2xx response | 1 |
| ✅ | tolerates a non-JSON error body (e.g. a missing-header 400 from Spring defaults) | 0 |

### XP rules (table shared with the backend) — 38/38

| | Cenário | ms |
|---|---|---|
| ✅ | the table is not empty and has no duplicate ids | 1 |
| ✅ | card-done-low | 1 |
| ✅ | card-done-medium | 0 |
| ✅ | card-done-high | 0 |
| ✅ | card-undone | 0 |
| ✅ | card-move-not-touching-done | 0 |
| ✅ | card-reorder-same-column | 0 |
| ✅ | card-done-redone | 0 |
| ✅ | clean-day-awarded | 0 |
| ✅ | clean-day-once-per-day | 0 |
| ✅ | clean-day-requires-empty-column | 0 |
| ✅ | clean-day-requires-completion | 0 |
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
| ✅ | streak-not-started-by-reversal | 1 |
| ✅ | streak-shown-zero-after-gap | 0 |
| ✅ | level-up-to-2 | 0 |
| ✅ | level-3-threshold | 0 |
| ✅ | level-drops-on-reversal | 0 |
| ✅ | rank-legend-caps | 0 |
| ✅ | full-day-combined | 0 |

### level table — 11/11

| | Cenário | ms |
|---|---|---|
| ✅ | level 1 requires 0 cumulative XP and is called 'Iniciante' | 0 |
| ✅ | level 2 requires 100 cumulative XP and is called 'Aprendiz' | 0 |
| ✅ | level 3 requires 260 cumulative XP and is called 'Focado' | 0 |
| ✅ | level 4 requires 480 cumulative XP and is called 'Constante' | 0 |
| ✅ | level 5 requires 760 cumulative XP and is called 'Estrategista' | 0 |
| ✅ | level 6 requires 1100 cumulative XP and is called 'Disciplinado' | 0 |
| ✅ | level 7 requires 1500 cumulative XP and is called 'Veterano' | 0 |
| ✅ | level 8 requires 1960 cumulative XP and is called 'Mestre' | 0 |
| ✅ | level 9 requires 2480 cumulative XP and is called 'Lenda' | 0 |
| ✅ | level 10 requires 3060 cumulative XP and is called 'Lenda' | 0 |
| ✅ | level 9 and above stays Lenda | 0 |

### invariants that hold for every scenario — 5/5

| | Cenário | ms |
|---|---|---|
| ✅ | the displayed total is never negative | 1 |
| ✅ | no event has a zero delta | 2 |
| ✅ | the raw total is always the ledger sum plus the opening balance | 1 |
| ✅ | applying zero actions never emits an event | 1 |
| ✅ | the level is always derivable from the displayed total | 1 |

### reducer is pure — 1/1

| | Cenário | ms |
|---|---|---|
| ✅ | returns the same state reference for an action with no effect | 0 |


## Backend (JUnit / Surefire)

**33/33 aprovados** · 1.60s

### AuthControllerTest — 4/4

| | Cenário | ms |
|---|---|---|
| ✅ | register_withValidBody_returns201 | 298 |
| ✅ | forgotPassword_alwaysReturns204 | 15 |
| ✅ | register_withBlankEmail_returns400 | 53 |
| ✅ | login_withWrongCredentials_returns401 | 16 |

### AuthServiceTest — 6/6

| | Cenário | ms |
|---|---|---|
| ✅ | login_ratelimited_neverReachesTheDatabase | 484 |
| ✅ | register_savesUserStatsAndSendsVerificationEmail | 13 |
| ✅ | register_propagatesInviteRejectionWithoutSendingEmail | 5 |
| ✅ | resetPassword_revokesEverySessionForTheUser | 7 |
| ✅ | login_unknownEmail_throwsUnauthorizedWithoutLeakingWhichFieldFailed | 4 |
| ✅ | login_wrongPassword_throwsUnauthorizedWithSameMessageAsUnknownEmail | 4 |

### BoardServiceTest — 2/2

| | Cenário | ms |
|---|---|---|
| ✅ | getBoard_withNoCards_skipsTheSubtaskQueryEntirely | 234 |
| ✅ | getBoard_withMultipleCards_queriesSubtasksExactlyOnce | 4 |

### CardServiceTest — 4/4

| | Cenário | ms |
|---|---|---|
| ✅ | create_withUnseenId_appendsAfterTheCurrentColumnMax | 69 |
| ✅ | delete_withAnotherUsersCard_throwsNotFoundNeverConflict | 7 |
| ✅ | create_withIdOwnedByAnotherUser_throwsConflict | 6 |
| ✅ | create_withIdAlreadyOwnedByCaller_isIdempotentAndDoesNotSaveAgain | 5 |

### FocusServiceTest — 5/5

| | Cenário | ms |
|---|---|---|
| ✅ | start_withAnAlreadyActiveSession_throwsConflict | 106 |
| ✅ | finish_completed_settlesFocusXpFromServerElapsedTime | 8 |
| ✅ | start_withAnotherUsersCard_throwsNotFound | 4 |
| ✅ | finish_abandoned_settlesNoXp | 4 |
| ✅ | finish_onAlreadyTerminalSession_throwsConflict | 4 |

### GoalServiceTest — 4/4

| | Cenário | ms |
|---|---|---|
| ✅ | delete_withAnotherUsersGoal_throwsNotFound | 6 |
| ✅ | create_withUnseenId_appendsAfterTheCurrentScopeMax | 7 |
| ✅ | create_withIdOwnedByAnotherUser_throwsConflict | 5 |
| ✅ | create_withIdAlreadyOwnedByCaller_isIdempotentAndDoesNotSaveAgain | 3 |

### MeServiceTest — 3/3

| | Cenário | ms |
|---|---|---|
| ✅ | export_onUnknownUser_throwsNotFound | 135 |
| ✅ | deleteAccount_removesTheUserRow_cascadeHandlesTheRest | 10 |
| ✅ | deleteAccount_onUnknownUser_throwsNotFound | 4 |

### StatsServiceTest — 2/2

| | Cenário | ms |
|---|---|---|
| ✅ | getStats_withStaleLastXpDay_showsStreakZero | 17 |
| ✅ | getStats_derivesLevelAndTodayFromTheLedger_neverFromStoredTotals | 31 |

### SubtaskServiceTest — 2/2

| | Cenário | ms |
|---|---|---|
| ✅ | update_onNonExistentSubtask_throwsNotFound | 7 |
| ✅ | update_onSubtaskOfAnotherUsersCard_throwsNotFound | 4 |

### XpRulesTableTest — 1/1

| | Cenário | ms |
|---|---|---|
| ✅ | everyScenarioMatchesTheSharedTable | 22 |

