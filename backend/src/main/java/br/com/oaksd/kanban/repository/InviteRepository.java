package br.com.oaksd.kanban.repository;

import br.com.oaksd.kanban.entity.Invite;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InviteRepository extends JpaRepository<Invite, String> {

  Optional<Invite> findByCode(String code);

  // Concurrency-safe consumption (PLAN.md decision #5): the row count tells
  // the caller whether this request won the race, not a prior SELECT.
  @Modifying
  @Query("""
      UPDATE Invite i SET i.usedAt = :now, i.usedBy = :userId
      WHERE i.code = :code AND i.usedAt IS NULL AND i.expiresAt > :now
      """)
  int consume(@Param("code") String code, @Param("userId") UUID userId, @Param("now") Instant now);
}
