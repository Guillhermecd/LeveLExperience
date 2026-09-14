package br.com.oaksd.kanban.dto.response;

import java.time.LocalDate;
import java.util.List;

// Already the read-side projection (level/rank/xpIntoLevel derived from the
// clamped total, streak zeroed once the gap is too old) — mirrors
// projectDisplayStats in frontend/src/features/kanban/reducer.ts, computed
// server-side because only the server knows the user's local "today".
public record StatsResponse(
    int xpTotal,
    int level,
    String rank,
    int xpIntoLevel,
    int xpForNextLevel,
    int streak,
    LocalDate lastXpDay,
    int dayXp,
    int dayDone,
    List<DayHistoryEntry> history) {
}
