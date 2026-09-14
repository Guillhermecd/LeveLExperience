package br.com.oaksd.kanban.repository;

import br.com.oaksd.kanban.entity.Subtask;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubtaskRepository extends JpaRepository<Subtask, UUID> {

  // GET /board: one query for every card at once, never one per card
  // (PLAN.md item 3).
  List<Subtask> findByCardIdInOrderByPositionAsc(Collection<UUID> cardIds);

  List<Subtask> findByCardIdOrderByPositionAsc(UUID cardId);

  Optional<Subtask> findTopByCardIdOrderByPositionDesc(UUID cardId);
}
