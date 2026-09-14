package br.com.oaksd.kanban.repository;

import br.com.oaksd.kanban.entity.FocusSession;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FocusSessionRepository extends JpaRepository<FocusSession, UUID> {

  Optional<FocusSession> findByIdAndUserId(UUID id, UUID userId);
}
