package br.com.oaksd.kanban.service;

import br.com.oaksd.kanban.dto.request.FinishFocusRequest;
import br.com.oaksd.kanban.dto.request.StartFocusRequest;
import br.com.oaksd.kanban.dto.response.FocusSessionResponse;
import br.com.oaksd.kanban.entity.Card;
import br.com.oaksd.kanban.entity.FocusSession;
import br.com.oaksd.kanban.entity.User;
import br.com.oaksd.kanban.exception.ConflictException;
import br.com.oaksd.kanban.exception.NotFoundException;
import br.com.oaksd.kanban.mapper.FocusSessionMapper;
import br.com.oaksd.kanban.repository.CardRepository;
import br.com.oaksd.kanban.repository.FocusSessionRepository;
import br.com.oaksd.kanban.repository.UserRepository;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FocusService {

  private final FocusSessionRepository focusSessionRepository;
  private final CardRepository cardRepository;
  private final UserRepository userRepository;
  private final FocusSessionMapper focusSessionMapper;
  private final XpService xpService;
  private final XpRuleEngine xpRuleEngine;

  public FocusService(FocusSessionRepository focusSessionRepository, CardRepository cardRepository,
      UserRepository userRepository, FocusSessionMapper focusSessionMapper, XpService xpService,
      XpRuleEngine xpRuleEngine) {
    this.focusSessionRepository = focusSessionRepository;
    this.cardRepository = cardRepository;
    this.userRepository = userRepository;
    this.focusSessionMapper = focusSessionMapper;
    this.xpService = xpService;
    this.xpRuleEngine = xpRuleEngine;
  }

  // focus_one_active_per_user_uidx (running/paused) is what actually
  // enforces "one active session per user" (gate 3.6) — not a pre-check
  // SELECT, which two concurrent requests would both pass.
  @Transactional
  public FocusSessionResponse start(UUID userId, StartFocusRequest request) {
    Card card = cardRepository.findByIdAndUserId(request.cardId(), userId)
        .orElseThrow(() -> new NotFoundException("Card não encontrado."));

    FocusSession session = new FocusSession();
    session.setUserId(userId);
    session.setCardId(card.getId());
    session.setPlannedMinutes(request.plannedMinutes());

    try {
      focusSessionRepository.saveAndFlush(session);
    } catch (DataIntegrityViolationException alreadyActive) {
      throw new ConflictException("Já existe uma sessão de foco ativa.");
    }
    return focusSessionMapper.toResponse(session);
  }

  // Elapsed time is measured from the server's started_at/paused_ms, never
  // trusted from the client (gate 3.7) — the request only says how it ended.
  @Transactional
  public FocusSessionResponse finish(UUID userId, UUID sessionId, FinishFocusRequest request,
      String idempotencyKey) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));
    FocusSession session = focusSessionRepository.findByIdAndUserId(sessionId, userId)
        .orElseThrow(() -> new NotFoundException("Sessão de foco não encontrada."));

    if (!"running".equals(session.getStatus()) && !"paused".equals(session.getStatus())) {
      throw new ConflictException("Sessão de foco já foi encerrada.");
    }

    Instant now = Instant.now();
    long elapsedMs = Duration.between(session.getStartedAt(), now).toMillis() - session.getPausedMs();
    int elapsedMinutes = (int) Math.max(0, elapsedMs / 60_000);

    session.setEndedAt(now);
    session.setStatus(request.outcome());
    focusSessionRepository.save(session);

    if ("completed".equals(request.outcome())) {
      LocalDate today = LocalDate.now(ZoneId.of(user.getTimezone()));
      int delta = xpRuleEngine.focusXp(session.getPlannedMinutes(), elapsedMinutes);
      xpService.settle(userId, "focus_session", delta, session.getCardId(), idempotencyKey, today);
    }

    return focusSessionMapper.toResponse(session);
  }
}
