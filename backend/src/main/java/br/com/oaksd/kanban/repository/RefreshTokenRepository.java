package br.com.oaksd.kanban.repository;

import br.com.oaksd.kanban.entity.RefreshToken;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

  Optional<RefreshToken> findByTokenHash(String tokenHash);

  @Modifying
  @Query("UPDATE RefreshToken r SET r.revokedAt = :now WHERE r.id = :id AND r.revokedAt IS NULL")
  int revoke(@Param("id") UUID id, @Param("now") Instant now);

  // Reuse of an already-revoked token means the family is compromised
  // (stolen refresh token replayed after rotation): kill every active session.
  @Modifying
  @Query("UPDATE RefreshToken r SET r.revokedAt = :now WHERE r.userId = :userId AND r.revokedAt IS NULL")
  int revokeAllForUser(@Param("userId") UUID userId, @Param("now") Instant now);
}
