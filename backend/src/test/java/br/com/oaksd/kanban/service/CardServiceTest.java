package br.com.oaksd.kanban.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.oaksd.kanban.dto.request.CreateCardRequest;
import br.com.oaksd.kanban.entity.Card;
import br.com.oaksd.kanban.exception.ConflictException;
import br.com.oaksd.kanban.exception.NotFoundException;
import br.com.oaksd.kanban.mapper.CardMapper;
import br.com.oaksd.kanban.repository.CardRepository;
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
  @Mock private CardMapper cardMapper;

  private CardService cardService;

  @BeforeEach
  void setUp() {
    cardService = new CardService(cardRepository, new PositionService(), cardMapper);
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
}
