package br.com.oaksd.kanban.repository;

import br.com.oaksd.kanban.entity.CalendarEvent;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CalendarEventRepository extends JpaRepository<CalendarEvent, UUID> {

  Optional<CalendarEvent> findByIdAndUserId(UUID id, UUID userId);

  /** Serves the month fetch; matches the (user_id, starts_at) index. */
  List<CalendarEvent> findByUserIdAndStartsAtBetweenOrderByStartsAtAsc(UUID userId, Instant from, Instant to);

  List<CalendarEvent> findByUserIdOrderByStartsAtAsc(UUID userId);
}
