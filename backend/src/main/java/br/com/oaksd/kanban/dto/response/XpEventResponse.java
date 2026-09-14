package br.com.oaksd.kanban.dto.response;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record XpEventResponse(Long id, LocalDate day, int delta, String reason, UUID refId, Instant createdAt) {
}
