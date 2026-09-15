package br.com.oaksd.kanban.dto.request;

import jakarta.validation.constraints.Size;

public record UpdatePreferencesRequest(@Size(max = 255) String name, boolean showGoals) {
}
