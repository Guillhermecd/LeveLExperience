package br.com.oaksd.kanban.dto.response;

import java.util.UUID;

public record GoalResponse(UUID id, String scope, String title, boolean done, double position) {
}
