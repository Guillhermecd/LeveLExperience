package br.com.oaksd.kanban.repository;

import br.com.oaksd.kanban.entity.AuthToken;
import br.com.oaksd.kanban.enums.TokenPurpose;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuthTokenRepository extends JpaRepository<AuthToken, UUID> {

  Optional<AuthToken> findByTokenHashAndPurpose(String tokenHash, TokenPurpose purpose);

  @Modifying
  @Query("UPDATE AuthToken t SET t.usedAt = :now WHERE t.id = :id AND t.usedAt IS NULL")
  int markUsed(@Param("id") UUID id, @Param("now") Instant now);
}
