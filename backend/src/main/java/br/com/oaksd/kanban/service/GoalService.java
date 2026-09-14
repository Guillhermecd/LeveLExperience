package br.com.oaksd.kanban.service;

import br.com.oaksd.kanban.dto.request.CreateGoalRequest;
import br.com.oaksd.kanban.dto.request.ToggleGoalRequest;
import br.com.oaksd.kanban.dto.request.UpdateGoalRequest;
import br.com.oaksd.kanban.dto.response.GoalResponse;
import br.com.oaksd.kanban.entity.Goal;
import br.com.oaksd.kanban.entity.User;
import br.com.oaksd.kanban.exception.ConflictException;
import br.com.oaksd.kanban.exception.NotFoundException;
import br.com.oaksd.kanban.mapper.GoalMapper;
import br.com.oaksd.kanban.repository.GoalRepository;
import br.com.oaksd.kanban.repository.UserRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GoalService {

  private final GoalRepository goalRepository;
  private final UserRepository userRepository;
  private final PositionService positionService;
  private final GoalMapper goalMapper;
  private final XpService xpService;
  private final XpRuleEngine xpRuleEngine;

  public GoalService(GoalRepository goalRepository, UserRepository userRepository, PositionService positionService,
      GoalMapper goalMapper, XpService xpService, XpRuleEngine xpRuleEngine) {
    this.goalRepository = goalRepository;
    this.userRepository = userRepository;
    this.positionService = positionService;
    this.goalMapper = goalMapper;
    this.xpService = xpService;
    this.xpRuleEngine = xpRuleEngine;
  }

  @Transactional
  public GoalResponse create(UUID userId, CreateGoalRequest request) {
    Goal existing = goalRepository.findById(request.id()).orElse(null);
    if (existing != null) {
      if (!existing.getUserId().equals(userId)) {
        throw new ConflictException("Este identificador de meta já está em uso.");
      }
      return goalMapper.toResponse(existing);
    }

    Goal goal = new Goal();
    goal.setId(request.id());
    goal.setUserId(userId);
    goal.setScope(request.scope());
    goal.setTitle(request.title());
    goal.setPosition(positionService.appendAfter(
        goalRepository.findTopByUserIdAndScopeOrderByPositionDesc(userId, request.scope())
            .map(Goal::getPosition)));
    goalRepository.save(goal);
    return goalMapper.toResponse(goal);
  }

  @Transactional
  public GoalResponse update(UUID userId, UUID goalId, UpdateGoalRequest request) {
    Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
        .orElseThrow(() -> new NotFoundException("Meta não encontrada."));
    goal.setTitle(request.title());
    goalRepository.save(goal);
    return goalMapper.toResponse(goal);
  }

  @Transactional
  public GoalResponse toggle(UUID userId, UUID goalId, ToggleGoalRequest request, String idempotencyKey) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));
    Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
        .orElseThrow(() -> new NotFoundException("Meta não encontrada."));

    if (goal.isDone() == request.done()) {
      return goalMapper.toResponse(goal);
    }
    goal.setDone(request.done());
    goalRepository.save(goal);

    LocalDate today = LocalDate.now(ZoneId.of(user.getTimezone()));
    int magnitude = xpRuleEngine.goalXp(goal.getScope());
    String reason = request.done() ? "goal_done" : "goal_undone";
    int delta = request.done() ? magnitude : -magnitude;
    xpService.settle(userId, reason, delta, goal.getId(), idempotencyKey, today);

    return goalMapper.toResponse(goal);
  }

  @Transactional
  public void delete(UUID userId, UUID goalId) {
    Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
        .orElseThrow(() -> new NotFoundException("Meta não encontrada."));
    goalRepository.delete(goal);
  }
}
