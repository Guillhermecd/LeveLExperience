package br.com.oaksd.kanban.controller;

import br.com.oaksd.kanban.dto.request.CreateCardRequest;
import br.com.oaksd.kanban.dto.request.UpdateCardRequest;
import br.com.oaksd.kanban.dto.response.CardResponse;
import br.com.oaksd.kanban.security.CurrentUser;
import br.com.oaksd.kanban.service.CardService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cards")
public class CardController {

  private final CardService cardService;

  public CardController(CardService cardService) {
    this.cardService = cardService;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public CardResponse create(@CurrentUser UUID userId, @Valid @RequestBody CreateCardRequest request) {
    return cardService.create(userId, request);
  }

  @PatchMapping("/{id}")
  public CardResponse update(@CurrentUser UUID userId, @PathVariable UUID id,
      @Valid @RequestBody UpdateCardRequest request) {
    return cardService.update(userId, id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@CurrentUser UUID userId, @PathVariable UUID id) {
    cardService.delete(userId, id);
  }
}
