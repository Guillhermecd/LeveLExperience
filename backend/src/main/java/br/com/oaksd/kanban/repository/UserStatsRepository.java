package br.com.oaksd.kanban.repository;

import br.com.oaksd.kanban.entity.UserStats;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserStatsRepository extends JpaRepository<UserStats, UUID> {

  // Serializes concurrent settlements for the same user (gate 3.2): the row
  // lock, not an application-level check, is what makes two racing requests
  // apply in sequence instead of one clobbering the other's streak update.
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select s from UserStats s where s.userId = :userId")
  Optional<UserStats> lockByUserId(@Param("userId") UUID userId);
}
