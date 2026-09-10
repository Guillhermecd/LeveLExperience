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

// No user_id column — ownership is reached through the parent card
// (PLAN.md decision #12: another user's card, and therefore its subtasks,
// must 404 like it doesn't exist, never leak via a direct subtask lookup).
@Entity
@Table(name = "subtasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Subtask {

  @Id
  private UUID id;

  @Column(name = "card_id", nullable = false)
  private UUID cardId;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false)
  private boolean done = false;

  @Column(nullable = false)
  private double position;

  @Column(name = "created_at", updatable = false)
  private Instant createdAt = Instant.now();
}
