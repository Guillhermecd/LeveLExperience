# Relatório de verificação

Gerado em 2026-09-15T20:54:52.343Z

**Situação: APROVADO** — 226/226 aprovados

---

## Frontend (Vitest)

**132/132 aprovados** · 0.16s

### apiRequest — 6/6

| | Cenário | ms |
|---|---|---|
| ✅ | never sends an Idempotency-Key on a GET request | 34 |
| ✅ | sends a freshly generated Idempotency-Key on a mutating request | 2 |
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

### buildMeetingAlerts — 11/11

| | Cenário | ms |
|---|---|---|
| ✅ | includes an event starting within the next 2 hours | 4 |
| ✅ | excludes an event more than 2 hours away | 1 |
| ✅ | excludes an event that already started | 0 |
| ✅ | includes an event starting at exactly now | 0 |
| ✅ | excludes an event starting exactly at the end of the 2h window | 0 |
| ✅ | includes an event one minute inside the window edge | 0 |
| ✅ | returns an empty list when there are no events at all | 0 |
| ✅ | excludes an event already in progress, even if it ends inside the window | 0 |
| ✅ | keeps every event inside the window, in the order received | 0 |
| ✅ | describes the alert with the local start time and keeps the raw instant in `when` | 1 |
| ✅ | preserves a unicode title verbatim | 0 |

### buildGoalDeadlineAlerts — 14/14

| | Cenário | ms |
|---|---|---|
| ✅ | includes an unfinished week goal within 2 days of the week ending | 1 |
| ✅ | includes an unfinished month goal within 2 days of the month ending | 0 |
| ✅ | excludes a goal far from its deadline | 0 |
| ✅ | excludes a goal that is already done, even near the deadline | 0 |
| ✅ | changes the alert id across periods so a dismissed overdue goal alerts again next period | 1 |
| ✅ | changes the alert id across months for a month goal | 0 |
| ✅ | keeps the same alert id on two different days of the same month | 0 |
| ✅ | includes a goal exactly 48 hours from its deadline | 2 |
| ✅ | includes a goal at the very last instant before its deadline | 0 |
| ✅ | still includes a goal 48h59m out because the hour diff truncates | 0 |
| ✅ | excludes a goal 49 hours out | 0 |
| ✅ | returns an empty list when there are no goals at all | 1 |
| ✅ | alerts a week goal on its own week deadline even when the month ends later | 0 |
| ✅ | points `when` at the deadline instant, not at now | 0 |

### buildGoalDeadlineAlerts under the pt-br locale — 2/2

| | Cenário | ms |
|---|---|---|
| ✅ | names the weekday in Portuguese for a week goal | 0 |
| ✅ | names the month in Portuguese for a month goal | 0 |

### dismissed alert storage — 9/9

| | Cenário | ms |
|---|---|---|
| ✅ | returns an empty set when nothing was ever dismissed | 1 |
| ✅ | round-trips a dismissed set | 0 |
| ✅ | round-trips an empty set as an empty set, never as null | 0 |
| ✅ | returns an empty set for corrupt json instead of throwing | 0 |
| ✅ | returns an empty set when the stored value is valid json but not an array | 0 |
| ✅ | drops non-string entries from a mixed array | 0 |
| ✅ | returns an empty set when localStorage itself throws on read | 0 |
| ✅ | swallows a write failure (quota) instead of breaking the dismiss | 1 |
| ✅ | overwrites the previous set rather than merging into it | 0 |

### calendarEvents api module — 14/14

| | Cenário | ms |
|---|---|---|
| ✅ | lists a month with the range as query params and no Idempotency-Key | 28 |
| ✅ | creates with POST, the client-generated id in the body and an Idempotency-Key | 2 |
| ✅ | updates with PATCH on the event path and an Idempotency-Key | 1 |
| ✅ | deletes with DELETE and tolerates the empty 204 body | 1 |
| ✅ | returns the parsed events on a successful list | 1 |
| ✅ | resolves to an empty list when the month has no events | 0 |
| ✅ | rejects with the server message when the event belongs to someone else (404) | 1 |
| ✅ | rejects with an ApiError on a delete that hits 404 | 1 |
| ✅ | rejects with a fallback message when the error body is not the ErrorResponse shape | 1 |
| ✅ | rejects with a validation message when the server refuses the payload (400) | 1 |
| ✅ | propagates a network failure instead of swallowing it | 1 |
| ✅ | sends nulls for an event with no description and no declared end | 0 |
| ✅ | keeps unicode in the title and description intact through the json body | 0 |
| ✅ | gives each mutation its own Idempotency-Key so a real retry is the caller decision | 1 |

### monthRange — 3/3

| | Cenário | ms |
|---|---|---|
| ✅ | spans the first to the last instant of the local month | 5 |
| ✅ | rolls over the year boundary (December to January) | 1 |
| ✅ | accepts a native Date as well as a Dayjs | 0 |

### groupByDay — 7/7

| | Cenário | ms |
|---|---|---|
| ✅ | returns days ascending and events sorted by time inside a day | 18 |
| ✅ | keeps an event that crosses midnight in the day it starts | 2 |
| ✅ | returns an empty list for an empty month | 1 |
| ✅ | does not mutate the array it was given | 0 |
| ✅ | keeps two events that start at the same instant, in the order received | 0 |
| ✅ | splits the first and the last instant of a day into their own days | 0 |
| ✅ | groups a whole busy month without losing an event | 7 |

### dayKeyOf — 2/2

| | Cenário | ms |
|---|---|---|
| ✅ | uses the local day of the instant, which is what the month grid renders | 0 |
| ✅ | rolls to the next local day right after local midnight | 0 |

### eventColorOptions — 3/3

| | Cenário | ms |
|---|---|---|
| ✅ | offers exactly one option per color in the union | 3 |
| ✅ | labels every option in Portuguese and non-empty | 1 |
| ✅ | takes every dot straight from the design tokens, never a literal hue | 2 |

### eventDotColor — 2/2

| | Cenário | ms |
|---|---|---|
| ✅ | resolves every color to the token hue used by the picker option | 1 |
| ✅ | resolves the default color used by new events | 0 |


## Backend (JUnit / Surefire)

**94/94 aprovados** · 4.69s

### AuthControllerTest — 4/4

| | Cenário | ms |
|---|---|---|
| ✅ | register_withValidBody_returns201 | 684 |
| ✅ | forgotPassword_alwaysReturns204 | 30 |
| ✅ | register_withBlankEmail_returns400 | 71 |
| ✅ | login_withWrongCredentials_returns401 | 48 |

### CalendarEventControllerTest — 22/22

| | Cenário | ms |
|---|---|---|
| ✅ | create_withTitleOverTheColumnLimit_returns400 | 146 |
| ✅ | list_withIsoRange_bindsTheMonthBoundariesAsInstants | 184 |
| ✅ | create_withValidBody_returns201WithTheEventContract | 23 |
| ✅ | create_withoutId_returns400 | 16 |
| ✅ | create_withAColorThatMerelyStartsWithAValidOne_returns400 | 21 |
| ✅ | create_withoutStartsAt_returns400 | 22 |
| ✅ | create_withTitleExactlyAtTheLimit_isAccepted | 42 |
| ✅ | update_withUnknownColor_returns400 | 41 |
| ✅ | create_withBlankTitle_returns400 | 23 |
| ✅ | create_withAnIdOwnedByAnotherUser_returns409 | 14 |
| ✅ | update_withAMalformedId_returns400 | 25 |
| ✅ | update_withValidBody_returns200 | 19 |
| ✅ | create_withUnknownColor_returns400 | 26 |
| ✅ | create_usesTheAuthenticatedUserAndTheClientGeneratedId | 20 |
| ✅ | list_withoutRange_delegatesNullBounds | 18 |
| ✅ | create_losingTheDuplicateIdRace_doesNotBlameTheEmail | 22 |
| ✅ | list_returnsTheAgendaContract | 23 |
| ✅ | delete_ofOwnEvent_returns204WithNoBody | 18 |
| ✅ | delete_ofAnotherUsersEvent_returns404 | 16 |
| ✅ | create_withEndBeforeStart_returns400WithTheServiceMessage | 13 |
| ✅ | list_withUnparseableFrom_returns400 | 15 |
| ✅ | update_ofAnotherUsersEvent_returns404 | 11 |

### CalendarEventMapperTest — 8/8

| | Cenário | ms |
|---|---|---|
| ✅ | toResponse_copiesEveryExposedField | 8 |
| ✅ | response_exposesOnlyTheAgendaFields | 42 |
| ✅ | toResponseList_ofNull_isNull | 3 |
| ✅ | toResponse_ofNull_isNull | 5 |
| ✅ | toResponse_preservesUnicodeAndAMaximumLengthTitle | 3 |
| ✅ | toResponseList_preservesOrder | 10 |
| ✅ | toResponse_keepsAnOpenEndedEventOpenEnded | 2 |
| ✅ | toResponseList_ofEmpty_isEmpty | 11 |

### AuthServiceTest — 8/8

| | Cenário | ms |
|---|---|---|
| ✅ | login_ratelimited_neverReachesTheDatabase | 996 |
| ✅ | register_savesUserStatsAndSendsVerificationEmail | 27 |
| ✅ | register_propagatesInviteRejectionWithoutSendingEmail | 12 |
| ✅ | changePassword_wrongCurrentPassword_throwsUnauthorizedAndChangesNothing | 19 |
| ✅ | changePassword_correctCurrentPassword_updatesHashAndRevokesEverySession | 9 |
| ✅ | resetPassword_revokesEverySessionForTheUser | 15 |
| ✅ | login_unknownEmail_throwsUnauthorizedWithoutLeakingWhichFieldFailed | 7 |
| ✅ | login_wrongPassword_throwsUnauthorizedWithSameMessageAsUnknownEmail | 9 |

### BoardServiceTest — 2/2

| | Cenário | ms |
|---|---|---|
| ✅ | getBoard_withNoCards_skipsTheSubtaskQueryEntirely | 733 |
| ✅ | getBoard_withMultipleCards_queriesSubtasksExactlyOnce | 17 |

### CalendarEventServiceTest — 20/20

| | Cenário | ms |
|---|---|---|
| ✅ | update_replacesEveryEditableField | 206 |
| ✅ | delete_ofAnotherUsersEvent_throwsNotFound | 6 |
| ✅ | update_withEndBeforeStart_isRejectedBeforeReadingTheEvent | 10 |
| ✅ | create_replayWithChangedPayload_returnsTheStoredEventUntouched | 4 |
| ✅ | create_withEndEqualToStart_isAccepted | 5 |
| ✅ | create_withEndBeforeStart_isRejected | 4 |
| ✅ | update_ofAnotherUsersEvent_throwsNotFound | 4 |
| ✅ | list_withNoEvents_returnsEmptyListAndNotNull | 5 |
| ✅ | create_doesNotSettleXp | 5 |
| ✅ | delete_twice_keepsReturningNotFound | 3 |
| ✅ | list_withoutRange_fallsBackToTheFullAgenda | 4 |
| ✅ | list_withRange_queriesTheBoundedFinder | 8 |
| ✅ | create_withIdOwnedByAnotherUser_throwsConflict | 6 |
| ✅ | list_returnsTheMappedResponsesInRepositoryOrder | 16 |
| ✅ | list_withOnlyOneBound_fallsBackToTheFullAgenda | 4 |
| ✅ | create_withUnseenId_persistsTheEvent | 14 |
| ✅ | create_withEndOneMilliBeforeStart_isRejected | 7 |
| ✅ | create_withIdAlreadyOwnedByCaller_isIdempotentAndDoesNotSaveAgain | 12 |
| ✅ | delete_ofOwnEvent_removesTheStoredEvent | 6 |
| ✅ | create_withoutEnd_isAccepted | 6 |

### CardServiceTest — 10/10

| | Cenário | ms |
|---|---|---|
| ✅ | move_withAfterIdAsTheLastCard_appendsAfterIt | 94 |
| ✅ | create_withUnseenId_appendsAfterTheCurrentColumnMax | 15 |
| ✅ | delete_withAnotherUsersCard_throwsNotFoundNeverConflict | 9 |
| ✅ | move_withNoAfterId_insertsBeforeTheCurrentFirstCard | 14 |
| ✅ | move_withCollapsedGap_rebalancesTheColumnBeforeInserting | 16 |
| ✅ | move_withinTheSameColumn_stillSettlesNoXpForANonDoneTransition | 16 |
| ✅ | move_withUnknownAfterId_throwsNotFound | 13 |
| ✅ | create_withIdOwnedByAnotherUser_throwsConflict | 13 |
| ✅ | move_withAfterIdBetweenTwoCards_landsOnTheMidpoint | 10 |
| ✅ | create_withIdAlreadyOwnedByCaller_isIdempotentAndDoesNotSaveAgain | 14 |

### FocusServiceTest — 5/5

| | Cenário | ms |
|---|---|---|
| ✅ | start_withAnAlreadyActiveSession_throwsConflict | 173 |
| ✅ | finish_completed_settlesFocusXpFromServerElapsedTime | 14 |
| ✅ | start_withAnotherUsersCard_throwsNotFound | 10 |
| ✅ | finish_abandoned_settlesNoXp | 8 |
| ✅ | finish_onAlreadyTerminalSession_throwsConflict | 11 |

### GoalServiceTest — 4/4

| | Cenário | ms |
|---|---|---|
| ✅ | delete_withAnotherUsersGoal_throwsNotFound | 8 |
| ✅ | create_withUnseenId_appendsAfterTheCurrentScopeMax | 9 |
| ✅ | create_withIdOwnedByAnotherUser_throwsConflict | 6 |
| ✅ | create_withIdAlreadyOwnedByCaller_isIdempotentAndDoesNotSaveAgain | 8 |

### MeServiceTest — 6/6

| | Cenário | ms |
|---|---|---|
| ✅ | updatePreferences_setsNameAndShowGoals_thenSaves | 230 |
| ✅ | getProfile_onUnknownUser_throwsNotFound | 5 |
| ✅ | export_onUnknownUser_throwsNotFound | 6 |
| ✅ | deleteAccount_removesTheUserRow_cascadeHandlesTheRest | 11 |
| ✅ | updatePreferences_onUnknownUser_throwsNotFound | 5 |
| ✅ | deleteAccount_onUnknownUser_throwsNotFound | 10 |

### StatsServiceTest — 2/2

| | Cenário | ms |
|---|---|---|
| ✅ | getStats_withStaleLastXpDay_showsStreakZero | 20 |
| ✅ | getStats_derivesLevelAndTodayFromTheLedger_neverFromStoredTotals | 7 |

### SubtaskServiceTest — 2/2

| | Cenário | ms |
|---|---|---|
| ✅ | update_onNonExistentSubtask_throwsNotFound | 22 |
| ✅ | update_onSubtaskOfAnotherUsersCard_throwsNotFound | 8 |

### XpRulesTableTest — 1/1

| | Cenário | ms |
|---|---|---|
| ✅ | everyScenarioMatchesTheSharedTable | 54 |

