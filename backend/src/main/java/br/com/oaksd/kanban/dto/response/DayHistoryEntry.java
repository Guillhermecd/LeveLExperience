package br.com.oaksd.kanban.dto.response;

import java.time.LocalDate;

// Mirrors frontend/src/types/board.ts DayHistoryEntry.
public record DayHistoryEntry(LocalDate day, int xp, int done) {
}
