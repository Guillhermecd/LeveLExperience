package br.com.oaksd.kanban.dto.response;

import java.util.UUID;

public record UserResponse(
    UUID id,
    String email,
    String name,
    String timezone,
    boolean showGoals,
    boolean emailVerified) {
}
