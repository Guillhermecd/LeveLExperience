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

// id is client-generated (PLAN.md decision #2): POST is an upsert, a resent
// request with the same id never creates a duplicate.
@Entity
@Table(name = "cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Card {

  @Id
  private UUID id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Column(name = "column_key", nullable = false)
  private String columnKey;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false)
  private short priority;

  @Column(nullable = false)
  private short tag = -1;

  @Column(nullable = false)
  private double position;

  @Column(nullable = false)
  private int poms = 0;

  @Column(name = "created_at", updatable = false)
  private Instant createdAt = Instant.now();

  @Column(name = "updated_at")
  private Instant updatedAt = Instant.now();
}
