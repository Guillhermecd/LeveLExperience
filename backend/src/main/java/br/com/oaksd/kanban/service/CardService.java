package br.com.oaksd.kanban.service;

import br.com.oaksd.kanban.dto.request.CreateCardRequest;
import br.com.oaksd.kanban.dto.request.MoveCardRequest;
import br.com.oaksd.kanban.dto.request.UpdateCardRequest;
import br.com.oaksd.kanban.dto.response.CardResponse;
import br.com.oaksd.kanban.entity.Card;
import br.com.oaksd.kanban.entity.User;
import br.com.oaksd.kanban.exception.ConflictException;
import br.com.oaksd.kanban.exception.NotFoundException;
import br.com.oaksd.kanban.mapper.CardMapper;
import br.com.oaksd.kanban.repository.CardRepository;
import br.com.oaksd.kanban.repository.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CardService {

  private final CardRepository cardRepository;
  private final UserRepository userRepository;
  private final PositionService positionService;
  private final CardMapper cardMapper;
  private final XpService xpService;
  private final XpRuleEngine xpRuleEngine;

  public CardService(CardRepository cardRepository, UserRepository userRepository, PositionService positionService,
      CardMapper cardMapper, XpService xpService, XpRuleEngine xpRuleEngine) {
    this.cardRepository = cardRepository;
    this.userRepository = userRepository;
    this.positionService = positionService;
    this.cardMapper = cardMapper;
    this.xpService = xpService;
    this.xpRuleEngine = xpRuleEngine;
  }

  // POST is an upsert by client id (decision #2): a resent create returns
  // the existing card unchanged instead of erroring or duplicating.
  @Transactional
  public CardResponse create(UUID userId, CreateCardRequest request) {
    Card existing = cardRepository.findById(request.id()).orElse(null);
    if (existing != null) {
      if (!existing.getUserId().equals(userId)) {
        throw new ConflictException("Este identificador de card já está em uso.");
      }
      return cardMapper.toResponse(existing, List.of());
    }

    Card card = new Card();
    card.setId(request.id());
    card.setUserId(userId);
    card.setColumnKey(request.columnKey());
    card.setTitle(request.title());
    card.setPriority(request.priority());
    card.setTag(request.tag());
    card.setPosition(positionService.appendAfter(
        cardRepository.findTopByUserIdAndColumnKeyOrderByPositionDesc(userId, request.columnKey())
            .map(Card::getPosition)));
    cardRepository.save(card);
    return cardMapper.toResponse(card, List.of());
  }

  @Transactional
  public CardResponse update(UUID userId, UUID cardId, UpdateCardRequest request) {
    Card card = cardRepository.findByIdAndUserId(cardId, userId)
        .orElseThrow(() -> new NotFoundException("Card não encontrado."));
    card.setTitle(request.title());
    card.setPriority(request.priority());
    card.setTag(request.tag());
    card.setUpdatedAt(Instant.now());
    cardRepository.save(card);
    return cardMapper.toResponse(card, List.of());
  }

  // Column transition, not a structural update (PLAN.md decision #1). XP
  // settles inside this same transaction — no network call happens between
  // the card write and the ledger write (PLAN.md item 4 "cuidados").
  @Transactional
  public CardResponse move(UUID userId, UUID cardId, MoveCardRequest request, String idempotencyKey) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));
    Card card = cardRepository.findByIdAndUserId(cardId, userId)
        .orElseThrow(() -> new NotFoundException("Card não encontrado."));

    String previousColumn = card.getColumnKey();
    String targetColumn = request.to();

    if (!previousColumn.equals(targetColumn)) {
      double position = positionService.appendAfter(
          cardRepository.findTopByUserIdAndColumnKeyOrderByPositionDesc(userId, targetColumn)
              .map(Card::getPosition));
      card.setColumnKey(targetColumn);
      card.setPosition(position);
      card.setUpdatedAt(Instant.now());
      cardRepository.save(card);

      settleMoveXp(userId, user, card, previousColumn, targetColumn, idempotencyKey);
    }

    return cardMapper.toResponse(card, List.of());
  }

  private void settleMoveXp(UUID userId, User user, Card card, String previousColumn, String targetColumn,
      String idempotencyKey) {
    boolean wasDone = "done".equals(previousColumn);
    boolean willBeDone = "done".equals(targetColumn);
    if (wasDone == willBeDone) {
      return;
    }

    LocalDate today = LocalDate.now(ZoneId.of(user.getTimezone()));

    if (willBeDone) {
      xpService.settle(userId, "card_done", xpRuleEngine.cardXp(card.getPriority()), card.getId(),
          idempotencyKey, today);

      // Clean-day bonus: this card was the last one in Today, and it just
      // isn't anymore. The derived key ("clean_day:<day>") is what makes the
      // bonus at-most-once-per-day — the same unique index xp_events retries
      // rely on, not an extra in-code check.
      boolean clearedToday = "today".equals(previousColumn)
          && cardRepository.countByUserIdAndColumnKey(userId, "today") == 0;
      if (clearedToday) {
        xpService.settle(userId, "clean_day", xpRuleEngine.cleanDayXp(), null, "clean_day:" + today, today);
      }
    } else {
      xpService.settle(userId, "card_undone", -xpRuleEngine.cardXp(card.getPriority()), card.getId(),
          idempotencyKey, today);
    }
  }

  @Transactional
  public void delete(UUID userId, UUID cardId) {
    Card card = cardRepository.findByIdAndUserId(cardId, userId)
        .orElseThrow(() -> new NotFoundException("Card não encontrado."));
    cardRepository.delete(card);
  }
}
