package br.com.oaksd.kanban.service;

import br.com.oaksd.kanban.dto.request.CreateSubtaskRequest;
import br.com.oaksd.kanban.dto.request.UpdateSubtaskRequest;
import br.com.oaksd.kanban.dto.response.SubtaskResponse;
import br.com.oaksd.kanban.entity.Card;
import br.com.oaksd.kanban.entity.Subtask;
import br.com.oaksd.kanban.exception.ConflictException;
import br.com.oaksd.kanban.exception.NotFoundException;
import br.com.oaksd.kanban.mapper.SubtaskMapper;
import br.com.oaksd.kanban.repository.CardRepository;
import br.com.oaksd.kanban.repository.SubtaskRepository;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SubtaskService {

  private final SubtaskRepository subtaskRepository;
  private final CardRepository cardRepository;
  private final PositionService positionService;
  private final SubtaskMapper subtaskMapper;

  public SubtaskService(SubtaskRepository subtaskRepository, CardRepository cardRepository,
      PositionService positionService, SubtaskMapper subtaskMapper) {
    this.subtaskRepository = subtaskRepository;
    this.cardRepository = cardRepository;
    this.positionService = positionService;
    this.subtaskMapper = subtaskMapper;
  }

  @Transactional
  public SubtaskResponse create(UUID userId, UUID cardId, CreateSubtaskRequest request) {
    Card card = cardRepository.findByIdAndUserId(cardId, userId)
        .orElseThrow(() -> new NotFoundException("Card não encontrado."));

    Subtask existing = subtaskRepository.findById(request.id()).orElse(null);
    if (existing != null) {
      if (!existing.getCardId().equals(cardId)) {
        throw new ConflictException("Este identificador de subtarefa já está em uso.");
      }
      return subtaskMapper.toResponse(existing);
    }

    Subtask subtask = new Subtask();
    subtask.setId(request.id());
    subtask.setCardId(card.getId());
    subtask.setTitle(request.title());
    subtask.setPosition(positionService.appendAfter(
        subtaskRepository.findTopByCardIdOrderByPositionDesc(cardId).map(Subtask::getPosition)));
    subtaskRepository.save(subtask);
    return subtaskMapper.toResponse(subtask);
  }

  @Transactional
  public SubtaskResponse update(UUID userId, UUID subtaskId, UpdateSubtaskRequest request) {
    Subtask subtask = findOwned(userId, subtaskId);
    subtask.setTitle(request.title());
    subtaskRepository.save(subtask);
    return subtaskMapper.toResponse(subtask);
  }

  @Transactional
  public void delete(UUID userId, UUID subtaskId) {
    Subtask subtask = findOwned(userId, subtaskId);
    subtaskRepository.delete(subtask);
  }

  // Subtasks have no user_id — ownership is the parent card's, so a subtask
  // on someone else's card 404s exactly like it doesn't exist (decision #12).
  private Subtask findOwned(UUID userId, UUID subtaskId) {
    Subtask subtask = subtaskRepository.findById(subtaskId)
        .orElseThrow(() -> new NotFoundException("Subtarefa não encontrada."));
    cardRepository.findByIdAndUserId(subtask.getCardId(), userId)
        .orElseThrow(() -> new NotFoundException("Subtarefa não encontrada."));
    return subtask;
  }
}
