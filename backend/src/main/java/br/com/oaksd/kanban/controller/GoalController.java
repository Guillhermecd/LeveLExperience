package br.com.oaksd.kanban.controller;

import br.com.oaksd.kanban.dto.request.CreateGoalRequest;
import br.com.oaksd.kanban.dto.request.ToggleGoalRequest;
import br.com.oaksd.kanban.dto.request.UpdateGoalRequest;
import br.com.oaksd.kanban.dto.response.GoalResponse;
import br.com.oaksd.kanban.security.CurrentUser;
import br.com.oaksd.kanban.service.GoalService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

  private final GoalService goalService;

  public GoalController(GoalService goalService) {
    this.goalService = goalService;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public GoalResponse create(@CurrentUser UUID userId, @Valid @RequestBody CreateGoalRequest request) {
    return goalService.create(userId, request);
  }

  @PatchMapping("/{id}")
  public GoalResponse update(@CurrentUser UUID userId, @PathVariable UUID id,
      @Valid @RequestBody UpdateGoalRequest request) {
    return goalService.update(userId, id, request);
  }

  @PostMapping("/{id}/toggle")
  public GoalResponse toggle(@CurrentUser UUID userId, @PathVariable UUID id,
      @Valid @RequestBody ToggleGoalRequest request,
      @RequestHeader("Idempotency-Key") String idempotencyKey) {
    return goalService.toggle(userId, id, request, idempotencyKey);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@CurrentUser UUID userId, @PathVariable UUID id) {
    goalService.delete(userId, id);
  }
}
