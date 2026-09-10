package br.com.oaksd.kanban.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.oaksd.kanban.dto.response.CardResponse;
import br.com.oaksd.kanban.entity.Card;
import br.com.oaksd.kanban.entity.Subtask;
import br.com.oaksd.kanban.mapper.CardMapper;
import br.com.oaksd.kanban.mapper.GoalMapper;
import br.com.oaksd.kanban.mapper.SubtaskMapper;
import br.com.oaksd.kanban.repository.CardRepository;
import br.com.oaksd.kanban.repository.GoalRepository;
import br.com.oaksd.kanban.repository.SubtaskRepository;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BoardServiceTest {

  @Mock private CardRepository cardRepository;
  @Mock private SubtaskRepository subtaskRepository;
  @Mock private GoalRepository goalRepository;
  @Mock private CardMapper cardMapper;
  @Mock private SubtaskMapper subtaskMapper;
  @Mock private GoalMapper goalMapper;

  private BoardService boardService;

  @BeforeEach
  void setUp() {
    boardService = new BoardService(cardRepository, subtaskRepository, goalRepository, cardMapper, subtaskMapper,
        goalMapper);
  }

  // PLAN.md item 3: one query for every card's subtasks, never one per card.
  @Test
  void getBoard_withMultipleCards_queriesSubtasksExactlyOnce() {
    UUID userId = UUID.randomUUID();
    Card card1 = card(UUID.randomUUID(), userId);
    Card card2 = card(UUID.randomUUID(), userId);
    when(cardRepository.findByUserIdOrderByColumnKeyAscPositionAsc(userId)).thenReturn(List.of(card1, card2));

    Subtask sub1 = new Subtask();
    sub1.setCardId(card1.getId());
    when(subtaskRepository.findByCardIdInOrderByPositionAsc(anyList())).thenReturn(List.of(sub1));
    when(subtaskMapper.toResponseList(anyList())).thenReturn(List.of());
    when(cardMapper.toResponse(any(), anyList())).thenReturn(
        new CardResponse(UUID.randomUUID(), "today", "t", (short) 0, (short) -1, 0, 0, List.of()));
    when(goalRepository.findByUserIdOrderByScopeAscPositionAsc(userId)).thenReturn(List.of());
    when(goalMapper.toResponseList(anyList())).thenReturn(List.of());

    boardService.getBoard(userId);

    verify(subtaskRepository, times(1)).findByCardIdInOrderByPositionAsc(anyList());
  }

  @Test
  void getBoard_withNoCards_skipsTheSubtaskQueryEntirely() {
    UUID userId = UUID.randomUUID();
    when(cardRepository.findByUserIdOrderByColumnKeyAscPositionAsc(userId)).thenReturn(List.of());
    when(goalRepository.findByUserIdOrderByScopeAscPositionAsc(userId)).thenReturn(List.of());
    when(goalMapper.toResponseList(anyList())).thenReturn(List.of());

    boardService.getBoard(userId);

    verify(subtaskRepository, never()).findByCardIdInOrderByPositionAsc(anyList());
  }

  private Card card(UUID id, UUID userId) {
    Card card = new Card();
    card.setId(id);
    card.setUserId(userId);
    card.setColumnKey("today");
    card.setTitle("t");
    return card;
  }
}
