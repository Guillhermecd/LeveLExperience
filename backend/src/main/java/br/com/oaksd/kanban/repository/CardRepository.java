package br.com.oaksd.kanban.repository;

import br.com.oaksd.kanban.entity.Card;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CardRepository extends JpaRepository<Card, UUID> {

  List<Card> findByUserIdOrderByColumnKeyAscPositionAsc(UUID userId);

  Optional<Card> findByIdAndUserId(UUID id, UUID userId);

  Optional<Card> findTopByUserIdAndColumnKeyOrderByPositionDesc(UUID userId, String columnKey);

  long countByUserIdAndColumnKey(UUID userId, String columnKey);

  // Drives /move's afterId resolution (gate 3.5): the ordered neighbours of
  // the drop point within the target column.
  List<Card> findByUserIdAndColumnKeyOrderByPositionAsc(UUID userId, String columnKey);
}
