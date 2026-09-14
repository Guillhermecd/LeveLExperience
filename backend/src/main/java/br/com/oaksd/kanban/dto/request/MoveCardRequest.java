package br.com.oaksd.kanban.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.util.UUID;

// Column transition, not a structural PATCH (PLAN.md decision #1).
// afterId places the card right after that card within the target column
// (gate 3.5); null means "make it the first card in the column" — there is
// no separate "unspecified" state, so a plain column-to-column drop with no
// reordering intent should still pass the card it currently follows.
public record MoveCardRequest(
    @NotBlank @Pattern(regexp = "backlog|today|doing|done") String to,
    UUID afterId) {
}
