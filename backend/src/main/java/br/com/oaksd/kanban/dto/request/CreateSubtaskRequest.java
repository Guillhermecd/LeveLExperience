package br.com.oaksd.kanban.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateSubtaskRequest(@NotNull UUID id, @NotBlank String title) {
}
