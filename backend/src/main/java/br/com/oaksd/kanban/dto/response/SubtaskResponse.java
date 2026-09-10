package br.com.oaksd.kanban.dto.response;

import java.util.UUID;

public record SubtaskResponse(UUID id, UUID cardId, String title, boolean done, double position) {
}
