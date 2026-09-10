package br.com.oaksd.kanban.dto.request;

import jakarta.validation.constraints.NotBlank;

// Toggling done is a transition (decision #1), settled with XP in the
// move-xp etapa — this only renames the subtask.
public record UpdateSubtaskRequest(@NotBlank String title) {
}
