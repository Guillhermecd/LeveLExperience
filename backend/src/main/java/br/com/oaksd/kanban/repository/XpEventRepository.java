package br.com.oaksd.kanban.repository;

import br.com.oaksd.kanban.entity.XpEvent;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface XpEventRepository extends JpaRepository<XpEvent, Long> {

  // user_stats.xp_total is a clamped cache of this sum (see XpService) — the
  // CHECK (xp_total >= 0) on user_stats means the raw, possibly negative,
  // running total is never stored: it is always recomputed from the ledger.
  @Query("select coalesce(sum(e.delta), 0) from XpEvent e where e.userId = :userId")
  int sumDeltaByUserId(@Param("userId") UUID userId);

  // Serves the 14-day histogram (GET /stats) and the full ledger export
  // (GET /me/export) — both read off xp_events_user_day_idx.
  List<XpEvent> findByUserIdAndDayGreaterThanEqualOrderByDayAsc(UUID userId, LocalDate since);

  List<XpEvent> findByUserIdOrderByDayAsc(UUID userId);

  // Feeds StatsResponse.cleanDayPaid — the frontend reducer needs the last
  // day the bonus was paid (any day) to reproduce the once-per-day rule.
  Optional<XpEvent> findFirstByUserIdAndReasonOrderByDayDesc(UUID userId, String reason);
}
