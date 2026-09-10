package br.com.oaksd.kanban.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

// Structural fields only — moving column is a transition (decision #1),
// not a PATCH; it belongs to the move-xp etapa.
public record UpdateCardRequest(
    @NotBlank String title,
    @Min(0) @Max(2) short priority,
    @Min(-1) @Max(3) short tag) {
}
