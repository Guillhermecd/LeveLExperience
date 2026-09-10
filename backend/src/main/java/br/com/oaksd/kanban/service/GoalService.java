package br.com.oaksd.kanban.service;

import br.com.oaksd.kanban.dto.request.CreateGoalRequest;
import br.com.oaksd.kanban.dto.request.UpdateGoalRequest;
import br.com.oaksd.kanban.dto.response.GoalResponse;
import br.com.oaksd.kanban.entity.Goal;
import br.com.oaksd.kanban.exception.ConflictException;
import br.com.oaksd.kanban.exception.NotFoundException;
import br.com.oaksd.kanban.mapper.GoalMapper;
import br.com.oaksd.kanban.repository.GoalRepository;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GoalService {

  private final GoalRepository goalRepository;
  private final PositionService positionService;
  private final GoalMapper goalMapper;

  public GoalService(GoalRepository goalRepository, PositionService positionService, GoalMapper goalMapper) {
    this.goalRepository = goalRepository;
    this.positionService = positionService;
    this.goalMapper = goalMapper;
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
  public void delete(UUID userId, UUID goalId) {
    Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
        .orElseThrow(() -> new NotFoundException("Meta não encontrada."));
    goalRepository.delete(goal);
  }
}
