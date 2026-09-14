package br.com.oaksd.kanban.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record FinishFocusRequest(@NotBlank @Pattern(regexp = "completed|abandoned") String outcome) {
}
