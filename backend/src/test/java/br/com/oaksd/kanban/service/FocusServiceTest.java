package br.com.oaksd.kanban.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.oaksd.kanban.dto.request.FinishFocusRequest;
import br.com.oaksd.kanban.dto.request.StartFocusRequest;
import br.com.oaksd.kanban.entity.Card;
import br.com.oaksd.kanban.entity.FocusSession;
import br.com.oaksd.kanban.entity.User;
import br.com.oaksd.kanban.exception.ConflictException;
import br.com.oaksd.kanban.exception.NotFoundException;
import br.com.oaksd.kanban.mapper.FocusSessionMapper;
import br.com.oaksd.kanban.repository.CardRepository;
import br.com.oaksd.kanban.repository.FocusSessionRepository;
import br.com.oaksd.kanban.repository.UserRepository;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

@ExtendWith(MockitoExtension.class)
class FocusServiceTest {

  @Mock private FocusSessionRepository focusSessionRepository;
  @Mock private CardRepository cardRepository;
  @Mock private UserRepository userRepository;
  @Mock private FocusSessionMapper focusSessionMapper;
  @Mock private XpService xpService;

  private FocusService focusService;

  @BeforeEach
  void setUp() {
    focusService = new FocusService(focusSessionRepository, cardRepository, userRepository, focusSessionMapper,
        xpService, new XpRuleEngine());
  }

  @Test
  void start_withAnAlreadyActiveSession_throwsConflict() {
    UUID userId = UUID.randomUUID();
    StartFocusRequest request = new StartFocusRequest(UUID.randomUUID(), 25);
    Card card = new Card();
    card.setId(request.cardId());
    when(cardRepository.findByIdAndUserId(request.cardId(), userId)).thenReturn(Optional.of(card));
    when(focusSessionRepository.saveAndFlush(any())).thenThrow(new DataIntegrityViolationException("dup"));

    assertThatThrownBy(() -> focusService.start(userId, request)).isInstanceOf(ConflictException.class);
  }

  @Test
  void start_withAnotherUsersCard_throwsNotFound() {
    UUID userId = UUID.randomUUID();
    StartFocusRequest request = new StartFocusRequest(UUID.randomUUID(), 25);
    when(cardRepository.findByIdAndUserId(request.cardId(), userId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> focusService.start(userId, request)).isInstanceOf(NotFoundException.class);
  }

  @Test
  void finish_completed_settlesFocusXpFromServerElapsedTime() {
    UUID userId = UUID.randomUUID();
    UUID sessionId = UUID.randomUUID();
    User user = new User();
    user.setTimezone("America/Sao_Paulo");
    when(userRepository.findById(userId)).thenReturn(Optional.of(user));

    FocusSession session = new FocusSession();
    session.setId(sessionId);
    session.setUserId(userId);
    session.setCardId(UUID.randomUUID());
    session.setPlannedMinutes(25);
    session.setStartedAt(Instant.now().minusSeconds(60 * 25));
    session.setStatus("running");
    when(focusSessionRepository.findByIdAndUserId(sessionId, userId)).thenReturn(Optional.of(session));

    focusService.finish(userId, sessionId, new FinishFocusRequest("completed"), "key-1");

    verify(xpService).settle(any(), org.mockito.ArgumentMatchers.eq("focus_session"), anyInt(), any(), anyString(),
        any());
    assertThat(session.getStatus()).isEqualTo("completed");
  }

  @Test
  void finish_abandoned_settlesNoXp() {
    UUID userId = UUID.randomUUID();
    UUID sessionId = UUID.randomUUID();
    User user = new User();
    user.setTimezone("America/Sao_Paulo");
    when(userRepository.findById(userId)).thenReturn(Optional.of(user));

    FocusSession session = new FocusSession();
    session.setId(sessionId);
    session.setUserId(userId);
    session.setStartedAt(Instant.now());
    session.setStatus("running");
    when(focusSessionRepository.findByIdAndUserId(sessionId, userId)).thenReturn(Optional.of(session));

    focusService.finish(userId, sessionId, new FinishFocusRequest("abandoned"), "key-1");

    verify(xpService, never()).settle(any(), anyString(), anyInt(), any(), anyString(), any());
    assertThat(session.getStatus()).isEqualTo("abandoned");
  }

  @Test
  void finish_onAlreadyTerminalSession_throwsConflict() {
    UUID userId = UUID.randomUUID();
    UUID sessionId = UUID.randomUUID();
    FocusSession session = new FocusSession();
    session.setId(sessionId);
    session.setStatus("completed");
    User user = new User();
    when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    when(focusSessionRepository.findByIdAndUserId(sessionId, userId)).thenReturn(Optional.of(session));

    assertThatThrownBy(() -> focusService.finish(userId, sessionId, new FinishFocusRequest("completed"), "key-1"))
        .isInstanceOf(ConflictException.class);
  }
}
