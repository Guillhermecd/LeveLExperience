package br.com.oaksd.kanban.dto.response;

import java.time.Instant;
import java.util.UUID;

public record CalendarEventResponse(
    UUID id,
    String title,
    String description,
    Instant startsAt,
    Instant endsAt,
    String color) {
}
