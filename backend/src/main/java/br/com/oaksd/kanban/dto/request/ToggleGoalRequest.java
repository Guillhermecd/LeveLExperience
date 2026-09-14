package br.com.oaksd.kanban.dto.request;

import jakarta.validation.constraints.NotNull;

public record ToggleGoalRequest(@NotNull Boolean done) {
}
