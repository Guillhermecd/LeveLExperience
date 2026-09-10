package br.com.oaksd.kanban.service;

import br.com.oaksd.kanban.dto.request.CreateCardRequest;
import br.com.oaksd.kanban.dto.request.UpdateCardRequest;
import br.com.oaksd.kanban.dto.response.CardResponse;
import br.com.oaksd.kanban.entity.Card;
import br.com.oaksd.kanban.exception.ConflictException;
import br.com.oaksd.kanban.exception.NotFoundException;
import br.com.oaksd.kanban.mapper.CardMapper;
import br.com.oaksd.kanban.repository.CardRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CardService {

  private final CardRepository cardRepository;
  private final PositionService positionService;
  private final CardMapper cardMapper;

  public CardService(CardRepository cardRepository, PositionService positionService, CardMapper cardMapper) {
    this.cardRepository = cardRepository;
    this.positionService = positionService;
    this.cardMapper = cardMapper;
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

  @Transactional
  public void delete(UUID userId, UUID cardId) {
    Card card = cardRepository.findByIdAndUserId(cardId, userId)
        .orElseThrow(() -> new NotFoundException("Card não encontrado."));
    cardRepository.delete(card);
  }
}
