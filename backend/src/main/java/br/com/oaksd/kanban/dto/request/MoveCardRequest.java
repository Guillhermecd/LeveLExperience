package br.com.oaksd.kanban.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

// Column transition, not a structural PATCH (PLAN.md decision #1). Free
// reordering within a column (afterId / rebalancing) is not implemented yet —
// a move always appends to the end of the target column.
public record MoveCardRequest(
    @NotBlank @Pattern(regexp = "backlog|today|doing|done") String to) {
}
