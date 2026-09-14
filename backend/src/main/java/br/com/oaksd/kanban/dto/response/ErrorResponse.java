package br.com.oaksd.kanban.dto.response;

import java.time.Instant;

public record ErrorResponse(Instant timestamp, int status, String error, String message) {
}
