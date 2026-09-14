package br.com.oaksd.kanban.dto.request;

import jakarta.validation.constraints.NotNull;

public record ToggleSubtaskRequest(@NotNull Boolean done) {
}
