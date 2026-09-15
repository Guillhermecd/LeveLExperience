# Relatório de verificação

Gerado em 2026-09-15T16:33:46.214Z

**Situação: APROVADO** — 136/136 aprovados

---

## Frontend (Vitest)

**84/84 aprovados** · 0.08s

### apiRequest — 6/6

| | Cenário | ms |
|---|---|---|
| ✅ | never sends an Idempotency-Key on a GET request | 22 |
| ✅ | sends a freshly generated Idempotency-Key on a mutating request | 1 |
| ✅ | retries after a 401 with the SAME Idempotency-Key it used on the first attempt | 1 |
| ✅ | does not retry a 401 on auth endpoints (skipAuthRetry) | 1 |
| ✅ | throws ApiError with the parsed message on a non-2xx response | 2 |
| ✅ | tolerates a non-JSON error body (e.g. a missing-header 400 from Spring defaults) | 1 |

### boardCache — 4/4

| | Cenário | ms |
|---|---|---|
| ✅ | returns null when nothing was ever cached | 2 |
| ✅ | round-trips a written cache | 1 |
| ✅ | returns null instead of throwing on invalid JSON | 0 |
| ✅ | returns null on a well-formed but incomplete shape | 0 |

### calendarEvents api module — 4/4

| | Cenário | ms |
|---|---|---|
| ✅ | lists a month with the range as query params and no Idempotency-Key | 20 |
| ✅ | creates with POST, the client-generated id in the body and an Idempotency-Key | 2 |
| ✅ | updates with PATCH on the event path and an Idempotency-Key | 1 |
| ✅ | deletes with DELETE and tolerates the empty 204 body | 1 |

### buildMeetingAlerts — 4/4

| | Cenário | ms |
|---|---|---|
| ✅ | includes an event starting within the next 2 hours | 2 |
| ✅ | excludes an event more than 2 hours away | 0 |
| ✅ | excludes an event that already started | 0 |
| ✅ | includes an event starting at exactly now | 0 |

### buildGoalDeadlineAlerts — 5/5

| | Cenário | ms |
|---|---|---|
| ✅ | includes an unfinished week goal within 2 days of the week ending | 1 |
| ✅ | includes an unfinished month goal within 2 days of the month ending | 0 |
| ✅ | excludes a goal far from its deadline | 0 |
| ✅ | excludes a goal that is already done, even near the deadline | 0 |
| ✅ | changes the alert id across periods so a dismissed overdue goal alerts again next period | 1 |

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
| ✅ | the displayed total is never negative | 0 |
| ✅ | no event has a zero delta | 1 |
| ✅ | the raw total is always the ledger sum plus the opening balance | 0 |
| ✅ | applying zero actions never emits an event | 0 |
| ✅ | the level is always derivable from the displayed total | 0 |

### reducer is pure — 1/1

| | Cenário | ms |
|---|---|---|
| ✅ | returns the same state reference for an action with no effect | 0 |

### monthRange — 3/3

| | Cenário | ms |
|---|---|---|
| ✅ | spans the first to the last instant of the local month | 3 |
| ✅ | rolls over the year boundary (December to January) | 1 |
| ✅ | accepts a native Date as well as a Dayjs | 0 |

### groupByDay — 3/3

| | Cenário | ms |
|---|---|---|
| ✅ | returns days ascending and events sorted by time inside a day | 11 |
| ✅ | keeps an event that crosses midnight in the day it starts | 1 |
| ✅ | returns an empty list for an empty month | 0 |


## Backend (JUnit / Surefire)

**52/52 aprovados** · 2.70s

### AuthControllerTest — 4/4

| | Cenário | ms |
|---|---|---|
| ✅ | register_withValidBody_returns201 | 569 |
| ✅ | forgotPassword_alwaysReturns204 | 25 |
| ✅ | register_withBlankEmail_returns400 | 140 |
| ✅ | login_withWrongCredentials_returns401 | 56 |

### AuthServiceTest — 8/8

| | Cenário | ms |
|---|---|---|
| ✅ | login_ratelimited_neverReachesTheDatabase | 909 |
| ✅ | register_savesUserStatsAndSendsVerificationEmail | 30 |
| ✅ | register_propagatesInviteRejectionWithoutSendingEmail | 7 |
| ✅ | changePassword_wrongCurrentPassword_throwsUnauthorizedAndChangesNothing | 6 |
| ✅ | changePassword_correctCurrentPassword_updatesHashAndRevokesEverySession | 5 |
| ✅ | resetPassword_revokesEverySessionForTheUser | 6 |
| ✅ | login_unknownEmail_throwsUnauthorizedWithoutLeakingWhichFieldFailed | 5 |
| ✅ | login_wrongPassword_throwsUnauthorizedWithSameMessageAsUnknownEmail | 3 |

### BoardServiceTest — 2/2

| | Cenário | ms |
|---|---|---|
| ✅ | getBoard_withNoCards_skipsTheSubtaskQueryEntirely | 275 |
| ✅ | getBoard_withMultipleCards_queriesSubtasksExactlyOnce | 6 |

### CalendarEventServiceTest — 8/8

| | Cenário | ms |
|---|---|---|
| ✅ | delete_ofAnotherUsersEvent_throwsNotFound | 95 |
| ✅ | create_withEndBeforeStart_isRejected | 3 |
| ✅ | update_ofAnotherUsersEvent_throwsNotFound | 3 |
| ✅ | create_doesNotSettleXp | 20 |
| ✅ | list_withRange_queriesTheBoundedFinder | 2 |
| ✅ | create_withIdOwnedByAnotherUser_throwsConflict | 1 |
| ✅ | create_withUnseenId_persistsTheEvent | 2 |
| ✅ | create_withIdAlreadyOwnedByCaller_isIdempotentAndDoesNotSaveAgain | 1 |

### CardServiceTest — 10/10

| | Cenário | ms |
|---|---|---|
| ✅ | move_withAfterIdAsTheLastCard_appendsAfterIt | 64 |
| ✅ | create_withUnseenId_appendsAfterTheCurrentColumnMax | 10 |
| ✅ | delete_withAnotherUsersCard_throwsNotFoundNeverConflict | 5 |
| ✅ | move_withNoAfterId_insertsBeforeTheCurrentFirstCard | 8 |
| ✅ | move_withCollapsedGap_rebalancesTheColumnBeforeInserting | 5 |
| ✅ | move_withinTheSameColumn_stillSettlesNoXpForANonDoneTransition | 5 |
| ✅ | move_withUnknownAfterId_throwsNotFound | 6 |
| ✅ | create_withIdOwnedByAnotherUser_throwsConflict | 5 |
| ✅ | move_withAfterIdBetweenTwoCards_landsOnTheMidpoint | 15 |
| ✅ | create_withIdAlreadyOwnedByCaller_isIdempotentAndDoesNotSaveAgain | 4 |

### FocusServiceTest — 5/5

| | Cenário | ms |
|---|---|---|
| ✅ | start_withAnAlreadyActiveSession_throwsConflict | 114 |
| ✅ | finish_completed_settlesFocusXpFromServerElapsedTime | 9 |
| ✅ | start_withAnotherUsersCard_throwsNotFound | 5 |
| ✅ | finish_abandoned_settlesNoXp | 4 |
| ✅ | finish_onAlreadyTerminalSession_throwsConflict | 5 |

### GoalServiceTest — 4/4

| | Cenário | ms |
|---|---|---|
| ✅ | delete_withAnotherUsersGoal_throwsNotFound | 6 |
| ✅ | create_withUnseenId_appendsAfterTheCurrentScopeMax | 6 |
| ✅ | create_withIdOwnedByAnotherUser_throwsConflict | 5 |
| ✅ | create_withIdAlreadyOwnedByCaller_isIdempotentAndDoesNotSaveAgain | 3 |

### MeServiceTest — 6/6

| | Cenário | ms |
|---|---|---|
| ✅ | updatePreferences_setsNameAndShowGoals_thenSaves | 152 |
| ✅ | getProfile_onUnknownUser_throwsNotFound | 10 |
| ✅ | export_onUnknownUser_throwsNotFound | 7 |
| ✅ | deleteAccount_removesTheUserRow_cascadeHandlesTheRest | 4 |
| ✅ | updatePreferences_onUnknownUser_throwsNotFound | 3 |
| ✅ | deleteAccount_onUnknownUser_throwsNotFound | 4 |

### StatsServiceTest — 2/2

| | Cenário | ms |
|---|---|---|
| ✅ | getStats_withStaleLastXpDay_showsStreakZero | 16 |
| ✅ | getStats_derivesLevelAndTodayFromTheLedger_neverFromStoredTotals | 9 |

### SubtaskServiceTest — 2/2

| | Cenário | ms |
|---|---|---|
| ✅ | update_onNonExistentSubtask_throwsNotFound | 8 |
| ✅ | update_onSubtaskOfAnotherUsersCard_throwsNotFound | 5 |

### XpRulesTableTest — 1/1

| | Cenário | ms |
|---|---|---|
| ✅ | everyScenarioMatchesTheSharedTable | 25 |

