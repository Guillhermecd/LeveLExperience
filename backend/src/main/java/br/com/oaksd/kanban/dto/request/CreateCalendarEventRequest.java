package br.com.oaksd.kanban.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

// Id is client-generated (decision #2), like card/subtask/goal.
// startsAt/endsAt are instants, never local dates: no all-day events in v1.
public record CreateCalendarEventRequest(
    @NotNull UUID id,
    @NotBlank @Size(max = 255) String title,
    @Size(max = 2000) String description,
    @NotNull Instant startsAt,
    Instant endsAt,
    @NotBlank @Pattern(regexp = "lime|amber|violet|coral|blue") String color) {
}
