package br.com.oaksd.kanban.service;

import br.com.oaksd.kanban.dto.response.BoardResponse;
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
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BoardService {

  private final CardRepository cardRepository;
  private final SubtaskRepository subtaskRepository;
  private final GoalRepository goalRepository;
  private final CardMapper cardMapper;
  private final SubtaskMapper subtaskMapper;
  private final GoalMapper goalMapper;

  public BoardService(CardRepository cardRepository, SubtaskRepository subtaskRepository,
      GoalRepository goalRepository, CardMapper cardMapper, SubtaskMapper subtaskMapper, GoalMapper goalMapper) {
    this.cardRepository = cardRepository;
    this.subtaskRepository = subtaskRepository;
    this.goalRepository = goalRepository;
    this.cardMapper = cardMapper;
    this.subtaskMapper = subtaskMapper;
    this.goalMapper = goalMapper;
  }

  @Transactional(readOnly = true)
  public BoardResponse getBoard(UUID userId) {
    List<Card> cards = cardRepository.findByUserIdOrderByColumnKeyAscPositionAsc(userId);
    List<UUID> cardIds = cards.stream().map(Card::getId).toList();

    // One query for every card's subtasks, never one per card (PLAN.md item 3).
    Map<UUID, List<Subtask>> subtasksByCard = cardIds.isEmpty()
        ? Map.of()
        : subtaskRepository.findByCardIdInOrderByPositionAsc(cardIds).stream()
            .collect(Collectors.groupingBy(Subtask::getCardId));

    List<CardResponse> cardResponses = cards.stream()
        .map(card -> cardMapper.toResponse(card,
            subtaskMapper.toResponseList(subtasksByCard.getOrDefault(card.getId(), List.of()))))
        .toList();

    return new BoardResponse(cardResponses, goalMapper.toResponseList(goalRepository.findByUserIdOrderByScopeAscPositionAsc(userId)));
  }
}
