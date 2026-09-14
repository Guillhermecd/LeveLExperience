package br.com.oaksd.kanban.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record StartFocusRequest(@NotNull UUID cardId, @Min(1) @Max(180) int plannedMinutes) {
}
