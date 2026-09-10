package br.com.oaksd.kanban.controller;

import br.com.oaksd.kanban.dto.request.CreateSubtaskRequest;
import br.com.oaksd.kanban.dto.request.UpdateSubtaskRequest;
import br.com.oaksd.kanban.dto.response.SubtaskResponse;
import br.com.oaksd.kanban.security.CurrentUser;
import br.com.oaksd.kanban.service.SubtaskService;
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
public class SubtaskController {

  private final SubtaskService subtaskService;

  public SubtaskController(SubtaskService subtaskService) {
    this.subtaskService = subtaskService;
  }

  @PostMapping("/api/cards/{cardId}/subtasks")
  @ResponseStatus(HttpStatus.CREATED)
  public SubtaskResponse create(@CurrentUser UUID userId, @PathVariable UUID cardId,
      @Valid @RequestBody CreateSubtaskRequest request) {
    return subtaskService.create(userId, cardId, request);
  }

  @PatchMapping("/api/subtasks/{id}")
  public SubtaskResponse update(@CurrentUser UUID userId, @PathVariable UUID id,
      @Valid @RequestBody UpdateSubtaskRequest request) {
    return subtaskService.update(userId, id, request);
  }

  @DeleteMapping("/api/subtasks/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@CurrentUser UUID userId, @PathVariable UUID id) {
    subtaskService.delete(userId, id);
  }
}
