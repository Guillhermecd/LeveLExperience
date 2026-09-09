package br.com.oaksd.kanban.entity;

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
import org.hibernate.annotations.JdbcType;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

  @Id
  @Column(updatable = false)
  private UUID id = UUID.randomUUID();

  // CITEXT in Postgres reports as Types#OTHER, not VARCHAR — without this the
  // schema validator (ddl-auto: validate) fails at boot.
  @JdbcType(CitextJdbcType.class)
  @Column(nullable = false)
  private String email;

  @Column(name = "password_hash", nullable = false)
  private String passwordHash;

  private String name;

  @Column(nullable = false)
  private String timezone = "America/Sao_Paulo";

  @Column(name = "show_goals", nullable = false)
  private boolean showGoals = true;

  @Column(name = "email_verified_at")
  private Instant emailVerifiedAt;

  @Column(name = "created_at", updatable = false)
  private Instant createdAt = Instant.now();

  // The DB trigger overwrites this on every UPDATE regardless of what we send.
  @Column(name = "updated_at")
  private Instant updatedAt = Instant.now();
}
