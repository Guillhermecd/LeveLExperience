# Relatório de verificação

Gerado em 2026-09-15T14:26:32.467Z

**Situação: APROVADO** — 109/109 aprovados

---

## Frontend (Vitest)

**65/65 aprovados** · 0.10s

### apiRequest — 6/6

| | Cenário | ms |
|---|---|---|
| ✅ | never sends an Idempotency-Key on a GET request | 52 |
| ✅ | sends a freshly generated Idempotency-Key on a mutating request | 3 |
| ✅ | retries after a 401 with the SAME Idempotency-Key it used on the first attempt | 4 |
| ✅ | does not retry a 401 on auth endpoints (skipAuthRetry) | 3 |
| ✅ | throws ApiError with the parsed message on a non-2xx response | 3 |
| ✅ | tolerates a non-JSON error body (e.g. a missing-header 400 from Spring defaults) | 1 |

### boardCache — 4/4

| | Cenário | ms |
|---|---|---|
| ✅ | returns null when nothing was ever cached | 5 |
| ✅ | round-trips a written cache | 2 |
| ✅ | returns null instead of throwing on invalid JSON | 1 |
| ✅ | returns null on a well-formed but incomplete shape | 1 |

### XP rules (table shared with the backend) — 38/38

| | Cenário | ms |
|---|---|---|
| ✅ | the table is not empty and has no duplicate ids | 3 |
| ✅ | card-done-low | 2 |
| ✅ | card-done-medium | 0 |
| ✅ | card-done-high | 1 |
| ✅ | card-undone | 1 |
| ✅ | card-move-not-touching-done | 0 |
| ✅ | card-reorder-same-column | 1 |
| ✅ | card-done-redone | 1 |
| ✅ | clean-day-awarded | 1 |
| ✅ | clean-day-once-per-day | 1 |
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
| ✅ | streak-not-started-by-reversal | 0 |
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
| ✅ | the displayed total is never negative | 2 |
| ✅ | no event has a zero delta | 4 |
| ✅ | the raw total is always the ledger sum plus the opening balance | 1 |
| ✅ | applying zero actions never emits an event | 1 |
| ✅ | the level is always derivable from the displayed total | 1 |

### reducer is pure — 1/1

| | Cenário | ms |
|---|---|---|
| ✅ | returns the same state reference for an action with no effect | 0 |


## Backend (JUnit / Surefire)

**44/44 aprovados** · 7.75s

### AuthControllerTest — 4/4

| | Cenário | ms |
|---|---|---|
| ✅ | register_withValidBody_returns201 | 1233 |
| ✅ | forgotPassword_alwaysReturns204 | 32 |
| ✅ | register_withBlankEmail_returns400 | 228 |
| ✅ | login_withWrongCredentials_returns401 | 357 |

### AuthServiceTest — 8/8

| | Cenário | ms |
|---|---|---|
| ✅ | login_ratelimited_neverReachesTheDatabase | 3823 |
| ✅ | register_savesUserStatsAndSendsVerificationEmail | 72 |
| ✅ | register_propagatesInviteRejectionWithoutSendingEmail | 15 |
| ✅ | changePassword_wrongCurrentPassword_throwsUnauthorizedAndChangesNothing | 13 |
| ✅ | changePassword_correctCurrentPassword_updatesHashAndRevokesEverySession | 12 |
| ✅ | resetPassword_revokesEverySessionForTheUser | 10 |
| ✅ | login_unknownEmail_throwsUnauthorizedWithoutLeakingWhichFieldFailed | 10 |
| ✅ | login_wrongPassword_throwsUnauthorizedWithSameMessageAsUnknownEmail | 14 |

### BoardServiceTest — 2/2

| | Cenário | ms |
|---|---|---|
| ✅ | getBoard_withNoCards_skipsTheSubtaskQueryEntirely | 902 |
| ✅ | getBoard_withMultipleCards_queriesSubtasksExactlyOnce | 16 |

### CardServiceTest — 10/10

| | Cenário | ms |
|---|---|---|
| ✅ | move_withAfterIdAsTheLastCard_appendsAfterIt | 109 |
| ✅ | create_withUnseenId_appendsAfterTheCurrentColumnMax | 18 |
| ✅ | delete_withAnotherUsersCard_throwsNotFoundNeverConflict | 14 |
| ✅ | move_withNoAfterId_insertsBeforeTheCurrentFirstCard | 12 |
| ✅ | move_withCollapsedGap_rebalancesTheColumnBeforeInserting | 13 |
| ✅ | move_withinTheSameColumn_stillSettlesNoXpForANonDoneTransition | 16 |
| ✅ | move_withUnknownAfterId_throwsNotFound | 14 |
| ✅ | create_withIdOwnedByAnotherUser_throwsConflict | 12 |
| ✅ | move_withAfterIdBetweenTwoCards_landsOnTheMidpoint | 7 |
| ✅ | create_withIdAlreadyOwnedByCaller_isIdempotentAndDoesNotSaveAgain | 10 |

### FocusServiceTest — 5/5

| | Cenário | ms |
|---|---|---|
| ✅ | start_withAnAlreadyActiveSession_throwsConflict | 196 |
| ✅ | finish_completed_settlesFocusXpFromServerElapsedTime | 25 |
| ✅ | start_withAnotherUsersCard_throwsNotFound | 14 |
| ✅ | finish_abandoned_settlesNoXp | 15 |
| ✅ | finish_onAlreadyTerminalSession_throwsConflict | 13 |

### GoalServiceTest — 4/4

| | Cenário | ms |
|---|---|---|
| ✅ | delete_withAnotherUsersGoal_throwsNotFound | 10 |
| ✅ | create_withUnseenId_appendsAfterTheCurrentScopeMax | 29 |
| ✅ | create_withIdOwnedByAnotherUser_throwsConflict | 26 |
| ✅ | create_withIdAlreadyOwnedByCaller_isIdempotentAndDoesNotSaveAgain | 24 |

### MeServiceTest — 6/6

| | Cenário | ms |
|---|---|---|
| ✅ | updatePreferences_setsNameAndShowGoals_thenSaves | 313 |
| ✅ | getProfile_onUnknownUser_throwsNotFound | 5 |
| ✅ | export_onUnknownUser_throwsNotFound | 8 |
| ✅ | deleteAccount_removesTheUserRow_cascadeHandlesTheRest | 6 |
| ✅ | updatePreferences_onUnknownUser_throwsNotFound | 5 |
| ✅ | deleteAccount_onUnknownUser_throwsNotFound | 6 |

### StatsServiceTest — 2/2

| | Cenário | ms |
|---|---|---|
| ✅ | getStats_withStaleLastXpDay_showsStreakZero | 19 |
| ✅ | getStats_derivesLevelAndTodayFromTheLedger_neverFromStoredTotals | 22 |

### SubtaskServiceTest — 2/2

| | Cenário | ms |
|---|---|---|
| ✅ | update_onNonExistentSubtask_throwsNotFound | 11 |
| ✅ | update_onSubtaskOfAnotherUsersCard_throwsNotFound | 8 |

### XpRulesTableTest — 1/1

| | Cenário | ms |
|---|---|---|
| ✅ | everyScenarioMatchesTheSharedTable | 31 |

