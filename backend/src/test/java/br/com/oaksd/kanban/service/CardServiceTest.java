package br.com.oaksd.kanban.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.oaksd.kanban.dto.request.CreateCardRequest;
import br.com.oaksd.kanban.dto.request.MoveCardRequest;
import br.com.oaksd.kanban.entity.Card;
import br.com.oaksd.kanban.entity.User;
import br.com.oaksd.kanban.exception.NotFoundException;
import br.com.oaksd.kanban.exception.ConflictException;
import br.com.oaksd.kanban.mapper.CardMapper;
import br.com.oaksd.kanban.repository.CardRepository;
import br.com.oaksd.kanban.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CardServiceTest {

  @Mock private CardRepository cardRepository;
  @Mock private UserRepository userRepository;
  @Mock private CardMapper cardMapper;
  @Mock private XpService xpService;

  private CardService cardService;

  @BeforeEach
  void setUp() {
    cardService = new CardService(cardRepository, userRepository, new PositionService(), cardMapper, xpService,
        new XpRuleEngine());
  }

  @Test
  void create_withUnseenId_appendsAfterTheCurrentColumnMax() {
    UUID userId = UUID.randomUUID();
    CreateCardRequest request = new CreateCardRequest(UUID.randomUUID(), "today", "Título", (short) 1, (short) -1);
    when(cardRepository.findById(request.id())).thenReturn(Optional.empty());
    Card existingTop = new Card();
    existingTop.setPosition(1024.0);
    when(cardRepository.findTopByUserIdAndColumnKeyOrderByPositionDesc(userId, "today"))
        .thenReturn(Optional.of(existingTop));

    cardService.create(userId, request);

    var captor = org.mockito.ArgumentCaptor.forClass(Card.class);
    verify(cardRepository).save(captor.capture());
    assertThat(captor.getValue().getPosition()).isEqualTo(2048.0);
    assertThat(captor.getValue().getUserId()).isEqualTo(userId);
  }

  @Test
  void create_withIdAlreadyOwnedByCaller_isIdempotentAndDoesNotSaveAgain() {
    UUID userId = UUID.randomUUID();
    CreateCardRequest request = new CreateCardRequest(UUID.randomUUID(), "today", "Título", (short) 1, (short) -1);
    Card existing = new Card();
    existing.setId(request.id());
    existing.setUserId(userId);
    when(cardRepository.findById(request.id())).thenReturn(Optional.of(existing));

    cardService.create(userId, request);

    verify(cardRepository, never()).save(any());
  }

  @Test
  void create_withIdOwnedByAnotherUser_throwsConflict() {
    UUID userId = UUID.randomUUID();
    CreateCardRequest request = new CreateCardRequest(UUID.randomUUID(), "today", "Título", (short) 1, (short) -1);
    Card existing = new Card();
    existing.setId(request.id());
    existing.setUserId(UUID.randomUUID());
    when(cardRepository.findById(request.id())).thenReturn(Optional.of(existing));

    assertThatThrownBy(() -> cardService.create(userId, request)).isInstanceOf(ConflictException.class);
    verify(cardRepository, never()).save(any());
  }

  @Test
  void delete_withAnotherUsersCard_throwsNotFoundNeverConflict() {
    UUID userId = UUID.randomUUID();
    UUID cardId = UUID.randomUUID();
    when(cardRepository.findByIdAndUserId(cardId, userId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> cardService.delete(userId, cardId)).isInstanceOf(NotFoundException.class);
  }

  private User aUser(UUID userId) {
    User user = new User();
    user.setId(userId);
    user.setTimezone("America/Sao_Paulo");
    return user;
  }

  private Card cardIn(UUID userId, String column, double position) {
    Card card = new Card();
    card.setId(UUID.randomUUID());
    card.setUserId(userId);
    card.setColumnKey(column);
    card.setPosition(position);
    return card;
  }

  @Test
  void move_withNoAfterId_insertsBeforeTheCurrentFirstCard() {
    UUID userId = UUID.randomUUID();
    Card moving = cardIn(userId, "backlog", 500.0);
    Card firstInTarget = cardIn(userId, "today", 1024.0);
    when(userRepository.findById(userId)).thenReturn(Optional.of(aUser(userId)));
    when(cardRepository.findByIdAndUserId(moving.getId(), userId)).thenReturn(Optional.of(moving));
    when(cardRepository.findByUserIdAndColumnKeyOrderByPositionAsc(userId, "today"))
        .thenReturn(List.of(firstInTarget));

    cardService.move(userId, moving.getId(), new MoveCardRequest("today", null), "key-1");

    assertThat(moving.getPosition()).isEqualTo(1024.0 - 1024.0);
    assertThat(moving.getColumnKey()).isEqualTo("today");
  }

  @Test
  void move_withAfterIdAsTheLastCard_appendsAfterIt() {
    UUID userId = UUID.randomUUID();
    Card moving = cardIn(userId, "backlog", 500.0);
    Card last = cardIn(userId, "today", 1024.0);
    when(userRepository.findById(userId)).thenReturn(Optional.of(aUser(userId)));
    when(cardRepository.findByIdAndUserId(moving.getId(), userId)).thenReturn(Optional.of(moving));
    when(cardRepository.findByUserIdAndColumnKeyOrderByPositionAsc(userId, "today")).thenReturn(List.of(last));

    cardService.move(userId, moving.getId(), new MoveCardRequest("today", last.getId()), "key-1");

    assertThat(moving.getPosition()).isEqualTo(1024.0 + 1024.0);
  }

  @Test
  void move_withAfterIdBetweenTwoCards_landsOnTheMidpoint() {
    UUID userId = UUID.randomUUID();
    Card moving = cardIn(userId, "backlog", 500.0);
    Card first = cardIn(userId, "today", 1024.0);
    Card second = cardIn(userId, "today", 2048.0);
    when(userRepository.findById(userId)).thenReturn(Optional.of(aUser(userId)));
    when(cardRepository.findByIdAndUserId(moving.getId(), userId)).thenReturn(Optional.of(moving));
    when(cardRepository.findByUserIdAndColumnKeyOrderByPositionAsc(userId, "today"))
        .thenReturn(List.of(first, second));

    cardService.move(userId, moving.getId(), new MoveCardRequest("today", first.getId()), "key-1");

    assertThat(moving.getPosition()).isEqualTo(1536.0);
  }

  @Test
  void move_withUnknownAfterId_throwsNotFound() {
    UUID userId = UUID.randomUUID();
    Card moving = cardIn(userId, "backlog", 500.0);
    when(userRepository.findById(userId)).thenReturn(Optional.of(aUser(userId)));
    when(cardRepository.findByIdAndUserId(moving.getId(), userId)).thenReturn(Optional.of(moving));
    when(cardRepository.findByUserIdAndColumnKeyOrderByPositionAsc(userId, "today")).thenReturn(List.of());

    assertThatThrownBy(() -> cardService.move(userId, moving.getId(),
        new MoveCardRequest("today", UUID.randomUUID()), "key-1"))
        .isInstanceOf(NotFoundException.class);
  }

  @Test
  void move_withCollapsedGap_rebalancesTheColumnBeforeInserting() {
    UUID userId = UUID.randomUUID();
    Card moving = cardIn(userId, "backlog", 500.0);
    Card first = cardIn(userId, "today", 1024.0);
    Card second = cardIn(userId, "today", 1024.00001);
    when(userRepository.findById(userId)).thenReturn(Optional.of(aUser(userId)));
    when(cardRepository.findByIdAndUserId(moving.getId(), userId)).thenReturn(Optional.of(moving));
    when(cardRepository.findByUserIdAndColumnKeyOrderByPositionAsc(userId, "today"))
        .thenReturn(List.of(first, second));

    cardService.move(userId, moving.getId(), new MoveCardRequest("today", first.getId()), "key-1");

    // Rebalanced to GAP/2*GAP, then inserted at the midpoint.
    assertThat(first.getPosition()).isEqualTo(1024.0);
    assertThat(second.getPosition()).isEqualTo(2048.0);
    assertThat(moving.getPosition()).isEqualTo(1536.0);
  }

  @Test
  void move_withinTheSameColumn_stillSettlesNoXpForANonDoneTransition() {
    UUID userId = UUID.randomUUID();
    Card moving = cardIn(userId, "today", 500.0);
    Card other = cardIn(userId, "today", 1024.0);
    when(userRepository.findById(userId)).thenReturn(Optional.of(aUser(userId)));
    when(cardRepository.findByIdAndUserId(moving.getId(), userId)).thenReturn(Optional.of(moving));
    when(cardRepository.findByUserIdAndColumnKeyOrderByPositionAsc(userId, "today"))
        .thenReturn(List.of(other));

    cardService.move(userId, moving.getId(), new MoveCardRequest("today", other.getId()), "key-1");

    verify(xpService, never()).settle(any(), any(), org.mockito.ArgumentMatchers.anyInt(), any(), any(), any());
  }
}
