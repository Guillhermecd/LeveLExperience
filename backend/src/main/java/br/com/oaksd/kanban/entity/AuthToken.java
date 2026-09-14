package br.com.oaksd.kanban.entity;

import br.com.oaksd.kanban.enums.TokenPurpose;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Email verification and password reset. token_hash stores a SHA-256 digest,
// never the raw token — a database dump must not become account access.
@Entity
@Table(name = "auth_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthToken {

  @Id
  @Column(updatable = false)
  private UUID id = UUID.randomUUID();

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Column(nullable = false)
  private TokenPurpose purpose;

  @Column(name = "token_hash", nullable = false)
  private String tokenHash;

  @Column(name = "expires_at", nullable = false)
  private Instant expiresAt;

  @Column(name = "used_at")
  private Instant usedAt;

  @Column(name = "created_at", updatable = false)
  private Instant createdAt = Instant.now();
}
