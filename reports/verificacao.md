# Relatório de verificação

Gerado em 2026-09-15T14:11:19.729Z

**Situação: APROVADO** — 107/107 aprovados

---

## Frontend (Vitest)

**65/65 aprovados** · 0.14s

### apiRequest — 6/6

| | Cenário | ms |
|---|---|---|
| ✅ | never sends an Idempotency-Key on a GET request | 57 |
| ✅ | sends a freshly generated Idempotency-Key on a mutating request | 2 |
| ✅ | retries after a 401 with the SAME Idempotency-Key it used on the first attempt | 6 |
| ✅ | does not retry a 401 on auth endpoints (skipAuthRetry) | 5 |
| ✅ | throws ApiError with the parsed message on a non-2xx response | 6 |
| ✅ | tolerates a non-JSON error body (e.g. a missing-header 400 from Spring defaults) | 3 |

### boardCache — 4/4

| | Cenário | ms |
|---|---|---|
| ✅ | returns null when nothing was ever cached | 8 |
| ✅ | round-trips a written cache | 4 |
| ✅ | returns null instead of throwing on invalid JSON | 1 |
| ✅ | returns null on a well-formed but incomplete shape | 1 |

### XP rules (table shared with the backend) — 38/38

| | Cenário | ms |
|---|---|---|
| ✅ | the table is not empty and has no duplicate ids | 3 |
| ✅ | card-done-low | 3 |
| ✅ | card-done-medium | 1 |
| ✅ | card-done-high | 1 |
| ✅ | card-undone | 1 |
| ✅ | card-move-not-touching-done | 1 |
| ✅ | card-reorder-same-column | 1 |
| ✅ | card-done-redone | 1 |
| ✅ | clean-day-awarded | 1 |
| ✅ | clean-day-once-per-day | 0 |
| ✅ | clean-day-requires-empty-column | 1 |
| ✅ | clean-day-requires-completion | 1 |
| ✅ | clean-day-card-from-other-column | 0 |
| ✅ | goal-week-done | 1 |
| ✅ | goal-month-done | 1 |
| ✅ | goal-reopen | 0 |
| ✅ | goal-toggle-is-idempotent | 1 |
| ✅ | subtask-done | 1 |
| ✅ | subtask-undone | 0 |
| ✅ | subtask-not-counted-as-completed | 1 |
| ✅ | focus-full-session | 1 |
| ✅ | focus-minimum-award | 0 |
| ✅ | focus-ended-early | 0 |
| ✅ | focus-capped-at-planned | 0 |
| ✅ | focus-abandoned | 0 |
| ✅ | total-never-negative | 1 |
| ✅ | ledger-keeps-real-delta | 1 |
| ✅ | streak-first-day | 0 |
| ✅ | streak-continues | 1 |
| ✅ | streak-resets-after-gap | 1 |
| ✅ | streak-once-per-day | 0 |
| ✅ | streak-not-started-by-reversal | 0 |
| ✅ | streak-shown-zero-after-gap | 0 |
| ✅ | level-up-to-2 | 0 |
| ✅ | level-3-threshold | 0 |
| ✅ | level-drops-on-reversal | 0 |
| ✅ | rank-legend-caps | 0 |
| ✅ | full-day-combined | 1 |

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
| ✅ | no event has a zero delta | 4 |
| ✅ | the raw total is always the ledger sum plus the opening balance | 3 |
| ✅ | applying zero actions never emits an event | 2 |
| ✅ | the level is always derivable from the displayed total | 3 |

### reducer is pure — 1/1

| | Cenário | ms |
|---|---|---|
| ✅ | returns the same state reference for an action with no effect | 1 |


## Backend (JUnit / Surefire)

**42/42 aprovados** · 9.67s

### AuthControllerTest — 4/4

| | Cenário | ms |
|---|---|---|
| ✅ | register_withValidBody_returns201 | 1191 |
| ✅ | forgotPassword_alwaysReturns204 | 25 |
| ✅ | register_withBlankEmail_returns400 | 65 |
| ✅ | login_withWrongCredentials_returns401 | 33 |

### AuthServiceTest — 6/6

| | Cenário | ms |
|---|---|---|
| ✅ | login_ratelimited_neverReachesTheDatabase | 1487 |
| ✅ | register_savesUserStatsAndSendsVerificationEmail | 28 |
| ✅ | register_propagatesInviteRejectionWithoutSendingEmail | 11 |
| ✅ | resetPassword_revokesEverySessionForTheUser | 12 |
| ✅ | login_unknownEmail_throwsUnauthorizedWithoutLeakingWhichFieldFailed | 9 |
| ✅ | login_wrongPassword_throwsUnauthorizedWithSameMessageAsUnknownEmail | 10 |

### BoardServiceTest — 2/2

| | Cenário | ms |
|---|---|---|
| ✅ | getBoard_withNoCards_skipsTheSubtaskQueryEntirely | 520 |
| ✅ | getBoard_withMultipleCards_queriesSubtasksExactlyOnce | 14 |

### CardServiceTest — 10/10

| | Cenário | ms |
|---|---|---|
| ✅ | move_withAfterIdAsTheLastCard_appendsAfterIt | 281 |
| ✅ | create_withUnseenId_appendsAfterTheCurrentColumnMax | 128 |
| ✅ | delete_withAnotherUsersCard_throwsNotFoundNeverConflict | 69 |
| ✅ | move_withNoAfterId_insertsBeforeTheCurrentFirstCard | 17 |
| ✅ | move_withCollapsedGap_rebalancesTheColumnBeforeInserting | 38 |
| ✅ | move_withinTheSameColumn_stillSettlesNoXpForANonDoneTransition | 31 |
| ✅ | move_withUnknownAfterId_throwsNotFound | 13 |
| ✅ | create_withIdOwnedByAnotherUser_throwsConflict | 12 |
| ✅ | move_withAfterIdBetweenTwoCards_landsOnTheMidpoint | 15 |
| ✅ | create_withIdAlreadyOwnedByCaller_isIdempotentAndDoesNotSaveAgain | 13 |

### FocusServiceTest — 5/5

| | Cenário | ms |
|---|---|---|
| ✅ | start_withAnAlreadyActiveSession_throwsConflict | 202 |
| ✅ | finish_completed_settlesFocusXpFromServerElapsedTime | 15 |
| ✅ | start_withAnotherUsersCard_throwsNotFound | 10 |
| ✅ | finish_abandoned_settlesNoXp | 10 |
| ✅ | finish_onAlreadyTerminalSession_throwsConflict | 10 |

### GoalServiceTest — 4/4

| | Cenário | ms |
|---|---|---|
| ✅ | delete_withAnotherUsersGoal_throwsNotFound | 11 |
| ✅ | create_withUnseenId_appendsAfterTheCurrentScopeMax | 11 |
| ✅ | create_withIdOwnedByAnotherUser_throwsConflict | 9 |
| ✅ | create_withIdAlreadyOwnedByCaller_isIdempotentAndDoesNotSaveAgain | 5 |

### MeServiceTest — 6/6

| | Cenário | ms |
|---|---|---|
| ✅ | updatePreferences_setsNameAndShowGoals_thenSaves | 5171 |
| ✅ | getProfile_onUnknownUser_throwsNotFound | 40 |
| ✅ | export_onUnknownUser_throwsNotFound | 21 |
| ✅ | deleteAccount_removesTheUserRow_cascadeHandlesTheRest | 13 |
| ✅ | updatePreferences_onUnknownUser_throwsNotFound | 15 |
| ✅ | deleteAccount_onUnknownUser_throwsNotFound | 17 |

### StatsServiceTest — 2/2

| | Cenário | ms |
|---|---|---|
| ✅ | getStats_withStaleLastXpDay_showsStreakZero | 18 |
| ✅ | getStats_derivesLevelAndTodayFromTheLedger_neverFromStoredTotals | 19 |

### SubtaskServiceTest — 2/2

| | Cenário | ms |
|---|---|---|
| ✅ | update_onNonExistentSubtask_throwsNotFound | 10 |
| ✅ | update_onSubtaskOfAnotherUsersCard_throwsNotFound | 9 |

### XpRulesTableTest — 1/1

| | Cenário | ms |
|---|---|---|
| ✅ | everyScenarioMatchesTheSharedTable | 34 |

