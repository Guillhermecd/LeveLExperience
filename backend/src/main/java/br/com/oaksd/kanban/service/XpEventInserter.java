package br.com.oaksd.kanban.service;

import br.com.oaksd.kanban.entity.XpEvent;
import br.com.oaksd.kanban.repository.XpEventRepository;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Isolated in its own Spring bean so {@code @Transactional(NESTED)} goes through the proxy
 * (a self-call from XpService would bypass it). NESTED opens a real Postgres SAVEPOINT: a
 * duplicate idempotency key rolls back only this insert, not the whole settlement transaction —
 * required because xp_events_idempotency_uidx is the actual idempotency mechanism (a resent
 * request must not abort the move it's retrying).
 */
@Component
public class XpEventInserter {

  private final XpEventRepository xpEventRepository;

  public XpEventInserter(XpEventRepository xpEventRepository) {
    this.xpEventRepository = xpEventRepository;
  }

  @Transactional(propagation = Propagation.NESTED)
  public boolean insertIfAbsent(UUID userId, String reason, int delta, UUID refId, String idempotencyKey,
      LocalDate day) {
    try {
      XpEvent event = new XpEvent();
      event.setUserId(userId);
      event.setDay(day);
      event.setDelta(delta);
      event.setReason(reason);
      event.setRefId(refId);
      event.setIdempotencyKey(idempotencyKey);
      xpEventRepository.saveAndFlush(event);
      return true;
    } catch (DataIntegrityViolationException alreadyApplied) {
      return false;
    }
  }
}
