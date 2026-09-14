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

// started_at is the server's (PLAN.md item 5): XP is the server-measured
// elapsed time, never a client-reported duration.
@Entity
@Table(name = "focus_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FocusSession {

  @Id
  private UUID id = UUID.randomUUID();

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Column(name = "card_id", nullable = false)
  private UUID cardId;

  @Column(name = "planned_minutes", nullable = false)
  private int plannedMinutes;

  @Column(name = "started_at", updatable = false)
  private Instant startedAt = Instant.now();

  @Column(name = "paused_at")
  private Instant pausedAt;

  @Column(name = "paused_ms", nullable = false)
  private long pausedMs = 0;

  @Column(name = "ended_at")
  private Instant endedAt;

  @Column(nullable = false)
  private String status = "running";
}
