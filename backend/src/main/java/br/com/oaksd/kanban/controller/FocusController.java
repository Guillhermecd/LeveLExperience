package br.com.oaksd.kanban.controller;

import br.com.oaksd.kanban.dto.request.FinishFocusRequest;
import br.com.oaksd.kanban.dto.request.StartFocusRequest;
import br.com.oaksd.kanban.dto.response.FocusSessionResponse;
import br.com.oaksd.kanban.security.CurrentUser;
import br.com.oaksd.kanban.service.FocusService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/focus")
public class FocusController {

  private final FocusService focusService;

  public FocusController(FocusService focusService) {
    this.focusService = focusService;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public FocusSessionResponse start(@CurrentUser UUID userId, @Valid @RequestBody StartFocusRequest request) {
    return focusService.start(userId, request);
  }

  @PostMapping("/{id}/finish")
  public FocusSessionResponse finish(@CurrentUser UUID userId, @PathVariable UUID id,
      @Valid @RequestBody FinishFocusRequest request,
      @RequestHeader("Idempotency-Key") String idempotencyKey) {
    return focusService.finish(userId, id, request, idempotencyKey);
  }
}
