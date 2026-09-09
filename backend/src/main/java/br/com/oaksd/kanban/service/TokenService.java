package br.com.oaksd.kanban.service;

import br.com.oaksd.kanban.config.AppProperties;
import br.com.oaksd.kanban.entity.AuthToken;
import br.com.oaksd.kanban.entity.RefreshToken;
import br.com.oaksd.kanban.enums.TokenPurpose;
import br.com.oaksd.kanban.exception.UnauthorizedException;
import br.com.oaksd.kanban.repository.AuthTokenRepository;
import br.com.oaksd.kanban.repository.RefreshTokenRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Opaque, single-use tokens for verify-email / password-reset / refresh.
// We store token_hash (SHA-256, deterministic) and look up BY that hash — a
// salted digest like BCrypt cannot be searched, only compared one at a time.
@Service
public class TokenService {

  private static final Duration EMAIL_VERIFICATION_TTL = Duration.ofHours(24);
  private static final Duration PASSWORD_RESET_TTL = Duration.ofHours(1);
  private static final SecureRandom RANDOM = new SecureRandom();

  private final AuthTokenRepository authTokenRepository;
  private final RefreshTokenRepository refreshTokenRepository;
  private final AppProperties properties;
  private final SessionRevoker sessionRevoker;

  public TokenService(AuthTokenRepository authTokenRepository, RefreshTokenRepository refreshTokenRepository,
      AppProperties properties, SessionRevoker sessionRevoker) {
    this.authTokenRepository = authTokenRepository;
    this.refreshTokenRepository = refreshTokenRepository;
    this.properties = properties;
    this.sessionRevoker = sessionRevoker;
  }

  public String issueEmailVerificationToken(UUID userId) {
    return issueAuthToken(userId, TokenPurpose.EMAIL_VERIFICATION, EMAIL_VERIFICATION_TTL);
  }

  public String issuePasswordResetToken(UUID userId) {
    return issueAuthToken(userId, TokenPurpose.PASSWORD_RESET, PASSWORD_RESET_TTL);
  }

  private String issueAuthToken(UUID userId, TokenPurpose purpose, Duration ttl) {
    String raw = generateRawToken();
    AuthToken token = new AuthToken();
    token.setUserId(userId);
    token.setPurpose(purpose);
    token.setTokenHash(hash(raw));
    token.setExpiresAt(Instant.now().plus(ttl));
    authTokenRepository.save(token);
    return raw;
  }

  // Consumes a verify-email/reset-password token: valid exactly once, and the
  // "used" flag is written before the caller acts on the result.
  @Transactional
  public UUID consumeAuthToken(String rawToken, TokenPurpose purpose) {
    AuthToken token = authTokenRepository.findByTokenHashAndPurpose(hash(rawToken), purpose)
        .orElseThrow(() -> new UnauthorizedException("Token inválido ou expirado."));
    if (token.getUsedAt() != null || token.getExpiresAt().isBefore(Instant.now())) {
      throw new UnauthorizedException("Token inválido ou expirado.");
    }
    int updated = authTokenRepository.markUsed(token.getId(), Instant.now());
    if (updated == 0) {
      throw new UnauthorizedException("Token inválido ou expirado.");
    }
    return token.getUserId();
  }

  public String issueRefreshToken(UUID userId, String userAgent) {
    String raw = generateRawToken();
    RefreshToken token = new RefreshToken();
    token.setUserId(userId);
    token.setTokenHash(hash(raw));
    token.setUserAgent(userAgent);
    token.setExpiresAt(Instant.now().plusMillis(properties.getJwt().getRefreshExpirationMs()));
    refreshTokenRepository.save(token);
    return raw;
  }

  public record RotationResult(UUID userId, String newRawToken) {
  }

  // Rotation: presenting a valid token revokes it and issues a new one.
  // Presenting an ALREADY-revoked token means the old one leaked and got
  // replayed — kill every active session for that user, not just this one.
  @Transactional
  public RotationResult rotateRefreshToken(String rawToken, String userAgent) {
    RefreshToken token = refreshTokenRepository.findByTokenHash(hash(rawToken))
        .orElseThrow(() -> new UnauthorizedException("Sessão inválida."));

    if (token.getRevokedAt() != null) {
      sessionRevoker.revokeAllSessions(token.getUserId());
      throw new UnauthorizedException("Sessão inválida.");
    }
    if (token.getExpiresAt().isBefore(Instant.now())) {
      throw new UnauthorizedException("Sessão inválida.");
    }

    refreshTokenRepository.revoke(token.getId(), Instant.now());
    String newRaw = issueRefreshToken(token.getUserId(), userAgent);
    return new RotationResult(token.getUserId(), newRaw);
  }

  public void revokeRefreshToken(String rawToken) {
    refreshTokenRepository.findByTokenHash(hash(rawToken))
        .ifPresent(token -> refreshTokenRepository.revoke(token.getId(), Instant.now()));
  }

  // Decision #10: a password change must invalidate any session an attacker
  // may already hold, not just the one presented in the request.
  public void revokeAllSessions(UUID userId) {
    sessionRevoker.revokeAllSessions(userId);
  }

  private String generateRawToken() {
    byte[] bytes = new byte[32];
    RANDOM.nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }

  private String hash(String raw) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      byte[] hashed = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
      return Base64.getUrlEncoder().withoutPadding().encodeToString(hashed);
    } catch (NoSuchAlgorithmException ex) {
      throw new IllegalStateException("SHA-256 indisponível.", ex);
    }
  }
}
