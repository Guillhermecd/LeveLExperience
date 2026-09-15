# Relatório de verificação

Gerado em 2026-09-15T15:33:07.618Z

**Situação: APROVADO** — 127/127 aprovados

---

## Frontend (Vitest)

**75/75 aprovados** · 0.09s

### apiRequest — 6/6

| | Cenário | ms |
|---|---|---|
| ✅ | never sends an Idempotency-Key on a GET request | 27 |
| ✅ | sends a freshly generated Idempotency-Key on a mutating request | 1 |
| ✅ | retries after a 401 with the SAME Idempotency-Key it used on the first attempt | 2 |
| ✅ | does not retry a 401 on auth endpoints (skipAuthRetry) | 1 |
| ✅ | throws ApiError with the parsed message on a non-2xx response | 1 |
| ✅ | tolerates a non-JSON error body (e.g. a missing-header 400 from Spring defaults) | 1 |

### boardCache — 4/4

| | Cenário | ms |
|---|---|---|
| ✅ | returns null when nothing was ever cached | 3 |
| ✅ | round-trips a written cache | 1 |
| ✅ | returns null instead of throwing on invalid JSON | 0 |
| ✅ | returns null on a well-formed but incomplete shape | 0 |

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
| ✅ | the displayed total is never negative | 1 |
| ✅ | no event has a zero delta | 2 |
| ✅ | the raw total is always the ledger sum plus the opening balance | 1 |
| ✅ | applying zero actions never emits an event | 1 |
| ✅ | the level is always derivable from the displayed total | 1 |

### reducer is pure — 1/1

| | Cenário | ms |
|---|---|---|
| ✅ | returns the same state reference for an action with no effect | 0 |

### calendarEvents api module — 4/4

| | Cenário | ms |
|---|---|---|
| ✅ | lists a month with the range as query params and no Idempotency-Key | 21 |
| ✅ | creates with POST, the client-generated id in the body and an Idempotency-Key | 2 |
| ✅ | updates with PATCH on the event path and an Idempotency-Key | 1 |
| ✅ | deletes with DELETE and tolerates the empty 204 body | 1 |

### monthRange — 3/3

| | Cenário | ms |
|---|---|---|
| ✅ | spans the first to the last instant of the local month | 3 |
| ✅ | rolls over the year boundary (December to January) | 1 |
| ✅ | accepts a native Date as well as a Dayjs | 0 |

### groupByDay — 3/3

| | Cenário | ms |
|---|---|---|
| ✅ | returns days ascending and events sorted by time inside a day | 12 |
| ✅ | keeps an event that crosses midnight in the day it starts | 2 |
| ✅ | returns an empty list for an empty month | 0 |


## Backend (JUnit / Surefire)

**52/52 aprovados** · 3.04s

### AuthControllerTest — 4/4

| | Cenário | ms |
|---|---|---|
| ✅ | register_withValidBody_returns201 | 447 |
| ✅ | forgotPassword_alwaysReturns204 | 14 |
| ✅ | register_withBlankEmail_returns400 | 59 |
| ✅ | login_withWrongCredentials_returns401 | 19 |

### AuthServiceTest — 8/8

| | Cenário | ms |
|---|---|---|
| ✅ | login_ratelimited_neverReachesTheDatabase | 666 |
| ✅ | register_savesUserStatsAndSendsVerificationEmail | 27 |
| ✅ | register_propagatesInviteRejectionWithoutSendingEmail | 6 |
| ✅ | changePassword_wrongCurrentPassword_throwsUnauthorizedAndChangesNothing | 6 |
| ✅ | changePassword_correctCurrentPassword_updatesHashAndRevokesEverySession | 4 |
| ✅ | resetPassword_revokesEverySessionForTheUser | 4 |
| ✅ | login_unknownEmail_throwsUnauthorizedWithoutLeakingWhichFieldFailed | 4 |
| ✅ | login_wrongPassword_throwsUnauthorizedWithSameMessageAsUnknownEmail | 4 |

### BoardServiceTest — 2/2

| | Cenário | ms |
|---|---|---|
| ✅ | getBoard_withNoCards_skipsTheSubtaskQueryEntirely | 258 |
| ✅ | getBoard_withMultipleCards_queriesSubtasksExactlyOnce | 5 |

### CalendarEventServiceTest — 8/8

| | Cenário | ms |
|---|---|---|
| ✅ | delete_ofAnotherUsersEvent_throwsNotFound | 1038 |
| ✅ | create_withEndBeforeStart_isRejected | 15 |
| ✅ | update_ofAnotherUsersEvent_throwsNotFound | 5 |
| ✅ | create_doesNotSettleXp | 18 |
| ✅ | list_withRange_queriesTheBoundedFinder | 5 |
| ✅ | create_withIdOwnedByAnotherUser_throwsConflict | 5 |
| ✅ | create_withUnseenId_persistsTheEvent | 15 |
| ✅ | create_withIdAlreadyOwnedByCaller_isIdempotentAndDoesNotSaveAgain | 2 |

### CardServiceTest — 10/10

| | Cenário | ms |
|---|---|---|
| ✅ | move_withAfterIdAsTheLastCard_appendsAfterIt | 49 |
| ✅ | create_withUnseenId_appendsAfterTheCurrentColumnMax | 8 |
| ✅ | delete_withAnotherUsersCard_throwsNotFoundNeverConflict | 6 |
| ✅ | move_withNoAfterId_insertsBeforeTheCurrentFirstCard | 4 |
| ✅ | move_withCollapsedGap_rebalancesTheColumnBeforeInserting | 4 |
| ✅ | move_withinTheSameColumn_stillSettlesNoXpForANonDoneTransition | 3 |
| ✅ | move_withUnknownAfterId_throwsNotFound | 6 |
| ✅ | create_withIdOwnedByAnotherUser_throwsConflict | 4 |
| ✅ | move_withAfterIdBetweenTwoCards_landsOnTheMidpoint | 3 |
| ✅ | create_withIdAlreadyOwnedByCaller_isIdempotentAndDoesNotSaveAgain | 5 |

### FocusServiceTest — 5/5

| | Cenário | ms |
|---|---|---|
| ✅ | start_withAnAlreadyActiveSession_throwsConflict | 80 |
| ✅ | finish_completed_settlesFocusXpFromServerElapsedTime | 6 |
| ✅ | start_withAnotherUsersCard_throwsNotFound | 5 |
| ✅ | finish_abandoned_settlesNoXp | 3 |
| ✅ | finish_onAlreadyTerminalSession_throwsConflict | 5 |

### GoalServiceTest — 4/4

| | Cenário | ms |
|---|---|---|
| ✅ | delete_withAnotherUsersGoal_throwsNotFound | 6 |
| ✅ | create_withUnseenId_appendsAfterTheCurrentScopeMax | 4 |
| ✅ | create_withIdOwnedByAnotherUser_throwsConflict | 5 |
| ✅ | create_withIdAlreadyOwnedByCaller_isIdempotentAndDoesNotSaveAgain | 3 |

### MeServiceTest — 6/6

| | Cenário | ms |
|---|---|---|
| ✅ | updatePreferences_setsNameAndShowGoals_thenSaves | 127 |
| ✅ | getProfile_onUnknownUser_throwsNotFound | 4 |
| ✅ | export_onUnknownUser_throwsNotFound | 4 |
| ✅ | deleteAccount_removesTheUserRow_cascadeHandlesTheRest | 3 |
| ✅ | updatePreferences_onUnknownUser_throwsNotFound | 3 |
| ✅ | deleteAccount_onUnknownUser_throwsNotFound | 5 |

### StatsServiceTest — 2/2

| | Cenário | ms |
|---|---|---|
| ✅ | getStats_withStaleLastXpDay_showsStreakZero | 17 |
| ✅ | getStats_derivesLevelAndTodayFromTheLedger_neverFromStoredTotals | 19 |

### SubtaskServiceTest — 2/2

| | Cenário | ms |
|---|---|---|
| ✅ | update_onNonExistentSubtask_throwsNotFound | 5 |
| ✅ | update_onSubtaskOfAnotherUsersCard_throwsNotFound | 6 |

### XpRulesTableTest — 1/1

| | Cenário | ms |
|---|---|---|
| ✅ | everyScenarioMatchesTheSharedTable | 14 |

