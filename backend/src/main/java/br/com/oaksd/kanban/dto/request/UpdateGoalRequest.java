package br.com.oaksd.kanban.dto.request;

import jakarta.validation.constraints.NotBlank;

public record UpdateGoalRequest(@NotBlank String title) {
}
