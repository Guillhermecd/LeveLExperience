# Relatório de verificação

Gerado em 2026-09-15T01:08:10.390Z

**Situação: APROVADO** — 108/108 aprovados

---

## Frontend (Vitest)

**67/67 aprovados** · 0.13s

### apiRequest — 6/6

| | Cenário | ms |
|---|---|---|
| ✅ | never sends an Idempotency-Key on a GET request | 56 |
| ✅ | sends a freshly generated Idempotency-Key on a mutating request | 3 |
| ✅ | retries after a 401 with the SAME Idempotency-Key it used on the first attempt | 3 |
| ✅ | does not retry a 401 on auth endpoints (skipAuthRetry) | 6 |
| ✅ | throws ApiError with the parsed message on a non-2xx response | 4 |
| ✅ | tolerates a non-JSON error body (e.g. a missing-header 400 from Spring defaults) | 9 |

### boardCache — 6/6

| | Cenário | ms |
|---|---|---|
| ✅ | returns null when nothing was cached for the user yet | 4 |
| ✅ | round-trips what was written for that user | 2 |
| ✅ | keeps caches for different users apart | 1 |
| ✅ | reads a corrupted value as null instead of throwing | 1 |
| ✅ | clearBoardCache removes only that user's entry | 1 |
| ✅ | a storage failure on write does not throw | 14 |

### XP rules (table shared with the backend) — 38/38

| | Cenário | ms |
|---|---|---|
| ✅ | the table is not empty and has no duplicate ids | 3 |
| ✅ | card-done-low | 2 |
| ✅ | card-done-medium | 1 |
| ✅ | card-done-high | 0 |
| ✅ | card-undone | 1 |
| ✅ | card-move-not-touching-done | 0 |
| ✅ | card-reorder-same-column | 0 |
| ✅ | card-done-redone | 0 |
| ✅ | clean-day-awarded | 0 |
| ✅ | clean-day-once-per-day | 0 |
| ✅ | clean-day-requires-empty-column | 0 |
| ✅ | clean-day-requires-completion | 0 |
| ✅ | clean-day-card-from-other-column | 0 |
| ✅ | goal-week-done | 2 |
| ✅ | goal-month-done | 1 |
| ✅ | goal-reopen | 0 |
| ✅ | goal-toggle-is-idempotent | 0 |
| ✅ | subtask-done | 1 |
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
| ✅ | level-3-threshold | 1 |
| ✅ | level-drops-on-reversal | 1 |
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
| ✅ | no event has a zero delta | 5 |
| ✅ | the raw total is always the ledger sum plus the opening balance | 2 |
| ✅ | applying zero actions never emits an event | 2 |
| ✅ | the level is always derivable from the displayed total | 1 |

### reducer is pure — 1/1

| | Cenário | ms |
|---|---|---|
| ✅ | returns the same state reference for an action with no effect | 0 |


## Backend (JUnit / Surefire)

**41/41 aprovados** · 3.42s

### AuthControllerTest — 4/4

| | Cenário | ms |
|---|---|---|
| ✅ | register_withValidBody_returns201 | 893 |
| ✅ | forgotPassword_alwaysReturns204 | 32 |
| ✅ | register_withBlankEmail_returns400 | 130 |
| ✅ | login_withWrongCredentials_returns401 | 38 |

### AuthServiceTest — 6/6

| | Cenário | ms |
|---|---|---|
| ✅ | login_ratelimited_neverReachesTheDatabase | 1185 |
| ✅ | register_savesUserStatsAndSendsVerificationEmail | 23 |
| ✅ | register_propagatesInviteRejectionWithoutSendingEmail | 8 |
| ✅ | resetPassword_revokesEverySessionForTheUser | 13 |
| ✅ | login_unknownEmail_throwsUnauthorizedWithoutLeakingWhichFieldFailed | 8 |
| ✅ | login_wrongPassword_throwsUnauthorizedWithSameMessageAsUnknownEmail | 5 |

### BoardServiceTest — 2/2

| | Cenário | ms |
|---|---|---|
| ✅ | getBoard_withNoCards_skipsTheSubtaskQueryEntirely | 376 |
| ✅ | getBoard_withMultipleCards_queriesSubtasksExactlyOnce | 7 |

### CardServiceTest — 10/10

| | Cenário | ms |
|---|---|---|
| ✅ | move_withAfterIdAsTheLastCard_appendsAfterIt | 93 |
| ✅ | create_withUnseenId_appendsAfterTheCurrentColumnMax | 22 |
| ✅ | delete_withAnotherUsersCard_throwsNotFoundNeverConflict | 11 |
| ✅ | move_withNoAfterId_insertsBeforeTheCurrentFirstCard | 6 |
| ✅ | move_withCollapsedGap_rebalancesTheColumnBeforeInserting | 7 |
| ✅ | move_withinTheSameColumn_stillSettlesNoXpForANonDoneTransition | 5 |
| ✅ | move_withUnknownAfterId_throwsNotFound | 8 |
| ✅ | create_withIdOwnedByAnotherUser_throwsConflict | 7 |
| ✅ | move_withAfterIdBetweenTwoCards_landsOnTheMidpoint | 6 |
| ✅ | create_withIdAlreadyOwnedByCaller_isIdempotentAndDoesNotSaveAgain | 4 |

### FocusServiceTest — 5/5

| | Cenário | ms |
|---|---|---|
| ✅ | start_withAnAlreadyActiveSession_throwsConflict | 126 |
| ✅ | finish_completed_settlesFocusXpFromServerElapsedTime | 10 |
| ✅ | start_withAnotherUsersCard_throwsNotFound | 5 |
| ✅ | finish_abandoned_settlesNoXp | 5 |
| ✅ | finish_onAlreadyTerminalSession_throwsConflict | 8 |

### GoalServiceTest — 4/4

| | Cenário | ms |
|---|---|---|
| ✅ | delete_withAnotherUsersGoal_throwsNotFound | 8 |
| ✅ | create_withUnseenId_appendsAfterTheCurrentScopeMax | 7 |
| ✅ | create_withIdOwnedByAnotherUser_throwsConflict | 21 |
| ✅ | create_withIdAlreadyOwnedByCaller_isIdempotentAndDoesNotSaveAgain | 6 |

### MeServiceTest — 5/5

| | Cenário | ms |
|---|---|---|
| ✅ | getProfile_onUnknownUser_throwsNotFound | 198 |
| ✅ | export_onUnknownUser_throwsNotFound | 4 |
| ✅ | getProfile_returnsTheMappedUser | 16 |
| ✅ | deleteAccount_removesTheUserRow_cascadeHandlesTheRest | 5 |
| ✅ | deleteAccount_onUnknownUser_throwsNotFound | 4 |

### StatsServiceTest — 2/2

| | Cenário | ms |
|---|---|---|
| ✅ | getStats_withStaleLastXpDay_showsStreakZero | 22 |
| ✅ | getStats_derivesLevelAndTodayFromTheLedger_neverFromStoredTotals | 44 |

### SubtaskServiceTest — 2/2

| | Cenário | ms |
|---|---|---|
| ✅ | update_onNonExistentSubtask_throwsNotFound | 8 |
| ✅ | update_onSubtaskOfAnotherUsersCard_throwsNotFound | 8 |

### XpRulesTableTest — 1/1

| | Cenário | ms |
|---|---|---|
| ✅ | everyScenarioMatchesTheSharedTable | 28 |

