package br.com.oaksd.kanban.dto.response;

import java.time.LocalDate;
import java.util.List;

// Already the read-side projection (level/rank/xpIntoLevel derived from the
// clamped total, streak zeroed once the gap is too old) — mirrors
// projectDisplayStats in frontend/src/features/kanban/reducer.ts, computed
// server-side because only the server knows the user's local "today".
public record StatsResponse(
    // The raw, possibly-negative signed total behind xpTotal — needed by
    // the frontend's optimistic reducer to seed LedgerStats without
    // diverging from the server on reversal scenarios ("ledger-keeps-real-delta"
    // in xp-rules.json: the displayed total floors at zero, but the next
    // event must still act on the real, negative running total).
    int rawTotal,
    int xpTotal,
    int level,
    String rank,
    int xpIntoLevel,
    int xpForNextLevel,
    int streak,
    LocalDate lastXpDay,
    // The day the clean-day bonus was last paid (any day, not just today) —
    // same reason: the reducer needs it to reproduce the once-per-day rule.
    LocalDate cleanDayPaid,
    int dayXp,
    int dayDone,
    List<DayHistoryEntry> history) {
}
