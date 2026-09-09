package br.com.oaksd.kanban.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Cache of what is expensive to derive per request (PLAN.md decision #3/#4);
// rebuildable from xp_events. The row is created at registration so the
// cards/goals etapa can assume it always exists.
@Entity
@Table(name = "user_stats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserStats {

  @Id
  @Column(name = "user_id")
  private UUID userId;

  @Column(name = "xp_total", nullable = false)
  private int xpTotal = 0;

  @Column(nullable = false)
  private int streak = 0;

  @Column(name = "last_xp_day")
  private LocalDate lastXpDay;
}
