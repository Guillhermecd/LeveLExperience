package br.com.oaksd.kanban.service;

import br.com.oaksd.kanban.dto.request.CreateSubtaskRequest;
import br.com.oaksd.kanban.dto.request.ToggleSubtaskRequest;
import br.com.oaksd.kanban.dto.request.UpdateSubtaskRequest;
import br.com.oaksd.kanban.dto.response.SubtaskResponse;
import br.com.oaksd.kanban.entity.Card;
import br.com.oaksd.kanban.entity.Subtask;
import br.com.oaksd.kanban.entity.User;
import br.com.oaksd.kanban.exception.ConflictException;
import br.com.oaksd.kanban.exception.NotFoundException;
import br.com.oaksd.kanban.mapper.SubtaskMapper;
import br.com.oaksd.kanban.repository.CardRepository;
import br.com.oaksd.kanban.repository.SubtaskRepository;
import br.com.oaksd.kanban.repository.UserRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SubtaskService {

  private final SubtaskRepository subtaskRepository;
  private final CardRepository cardRepository;
  private final UserRepository userRepository;
  private final PositionService positionService;
  private final SubtaskMapper subtaskMapper;
  private final XpService xpService;
  private final XpRuleEngine xpRuleEngine;

  public SubtaskService(SubtaskRepository subtaskRepository, CardRepository cardRepository,
      UserRepository userRepository, PositionService positionService, SubtaskMapper subtaskMapper,
      XpService xpService, XpRuleEngine xpRuleEngine) {
    this.subtaskRepository = subtaskRepository;
    this.cardRepository = cardRepository;
    this.userRepository = userRepository;
    this.positionService = positionService;
    this.subtaskMapper = subtaskMapper;
    this.xpService = xpService;
    this.xpRuleEngine = xpRuleEngine;
  }

  @Transactional
  public SubtaskResponse create(UUID userId, UUID cardId, CreateSubtaskRequest request) {
    Card card = cardRepository.findByIdAndUserId(cardId, userId)
        .orElseThrow(() -> new NotFoundException("Card não encontrado."));

    // Bare findById is intentional (see CardService.create): it must see a
    // subtask under ANY card to catch a global client-generated id collision.
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

  // Checking awards XP; unchecking never reverses it (PLAN.md decision —
  // subtask +5, no reversal, unlike card/goal done-undone pairs).
  @Transactional
  public SubtaskResponse toggle(UUID userId, UUID subtaskId, ToggleSubtaskRequest request, String idempotencyKey) {
    Subtask subtask = findOwned(userId, subtaskId);
    if (subtask.isDone() == request.done()) {
      return subtaskMapper.toResponse(subtask);
    }
    subtask.setDone(request.done());
    subtaskRepository.save(subtask);

    if (request.done()) {
      User user = userRepository.findById(userId)
          .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));
      LocalDate today = LocalDate.now(ZoneId.of(user.getTimezone()));
      xpService.settle(userId, "subtask_done", xpRuleEngine.subtaskXp(), subtask.getId(), idempotencyKey, today);
    }

    return subtaskMapper.toResponse(subtask);
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
