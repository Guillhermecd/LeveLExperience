package br.com.oaksd.kanban.service;

import br.com.oaksd.kanban.repository.RefreshTokenRepository;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

// Separate bean so REQUIRES_NEW actually applies: a call from within
// TokenService itself would bypass the transactional proxy (Spring
// self-invocation) and run in the caller's transaction instead.
@Component
public class SessionRevoker {

  private final RefreshTokenRepository refreshTokenRepository;

  public SessionRevoker(RefreshTokenRepository refreshTokenRepository) {
    this.refreshTokenRepository = refreshTokenRepository;
  }

  // Independent transaction: the caller (refresh-token reuse detection)
  // throws right after this returns, which must not roll back the revocation
  // together with it — that's the one effect that has to survive.
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void revokeAllSessions(UUID userId) {
    refreshTokenRepository.revokeAllForUser(userId, Instant.now());
  }
}
