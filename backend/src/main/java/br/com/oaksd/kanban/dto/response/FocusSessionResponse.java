package br.com.oaksd.kanban.dto.response;

import java.time.Instant;
import java.util.UUID;

public record FocusSessionResponse(
    UUID id,
    UUID cardId,
    int plannedMinutes,
    Instant startedAt,
    Instant endedAt,
    String status) {
}
