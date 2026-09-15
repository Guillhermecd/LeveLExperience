package br.com.oaksd.kanban.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.Instant;

// Total replacement of the editable fields (same shape as UpdateCardRequest):
// the client always sends the whole form back, so a missing field is a bug,
// not "keep the old value".
public record UpdateCalendarEventRequest(
    @NotBlank @Size(max = 255) String title,
    @Size(max = 2000) String description,
    @NotNull Instant startsAt,
    Instant endsAt,
    @NotBlank @Pattern(regexp = "lime|amber|violet|coral|blue") String color) {
}
