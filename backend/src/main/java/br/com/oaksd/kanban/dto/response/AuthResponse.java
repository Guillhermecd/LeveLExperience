package br.com.oaksd.kanban.dto.response;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    long accessExpiresInSeconds,
    UserResponse user) {
}
