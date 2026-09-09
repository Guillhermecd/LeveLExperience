package br.com.oaksd.kanban.security;

import br.com.oaksd.kanban.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Component;

// Access-token concerns only (decision #10: short-lived, stateless). Refresh
// and email/reset tokens are opaque, hashed and persisted — see TokenService.
@Component
public class JwtService {

  private final SecretKey key;
  private final long accessExpirationMs;

  public JwtService(AppProperties properties) {
    this.key = Keys.hmacShaKeyFor(properties.getJwt().getSecret().getBytes(StandardCharsets.UTF_8));
    this.accessExpirationMs = properties.getJwt().getAccessExpirationMs();
  }

  public String generateAccessToken(UUID userId) {
    Instant now = Instant.now();
    return Jwts.builder()
        .subject(userId.toString())
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plusMillis(accessExpirationMs)))
        .signWith(key)
        .compact();
  }

  public long getAccessExpirationSeconds() {
    return accessExpirationMs / 1000;
  }

  public Optional<UUID> parseUserId(String token) {
    try {
      Claims claims = Jwts.parser().verifyWith(key).build()
          .parseSignedClaims(token)
          .getPayload();
      return Optional.of(UUID.fromString(claims.getSubject()));
    } catch (JwtException | IllegalArgumentException ex) {
      return Optional.empty();
    }
  }
}
