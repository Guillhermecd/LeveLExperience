package br.com.oaksd.kanban.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Append-only ledger row (PLAN.md decision #3). Never updated, never deleted.
@Entity
@Table(name = "xp_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class XpEvent {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  // The user's LOCAL day, computed from users.timezone (PLAN.md item 3.10).
  @Column(nullable = false)
  private LocalDate day;

  @Column(nullable = false)
  private int delta;

  @Column(nullable = false)
  private String reason;

  @Column(name = "ref_id")
  private UUID refId;

  @Column(name = "idempotency_key", nullable = false)
  private String idempotencyKey;

  @Column(name = "created_at", updatable = false)
  private Instant createdAt = Instant.now();
}
