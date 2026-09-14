package br.com.oaksd.kanban.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.oaksd.kanban.dto.request.CreateGoalRequest;
import br.com.oaksd.kanban.entity.Goal;
import br.com.oaksd.kanban.exception.ConflictException;
import br.com.oaksd.kanban.exception.NotFoundException;
import br.com.oaksd.kanban.mapper.GoalMapper;
import br.com.oaksd.kanban.repository.GoalRepository;
import br.com.oaksd.kanban.repository.UserRepository;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class GoalServiceTest {

  @Mock private GoalRepository goalRepository;
  @Mock private UserRepository userRepository;
  @Mock private GoalMapper goalMapper;
  @Mock private XpService xpService;

  private GoalService goalService;

  @BeforeEach
  void setUp() {
    goalService = new GoalService(goalRepository, userRepository, new PositionService(), goalMapper, xpService,
        new XpRuleEngine());
  }

  @Test
  void create_withUnseenId_appendsAfterTheCurrentScopeMax() {
    UUID userId = UUID.randomUUID();
    CreateGoalRequest request = new CreateGoalRequest(UUID.randomUUID(), "week", "Meta");
    when(goalRepository.findById(request.id())).thenReturn(Optional.empty());
    Goal existingTop = new Goal();
    existingTop.setPosition(1024.0);
    when(goalRepository.findTopByUserIdAndScopeOrderByPositionDesc(userId, "week"))
        .thenReturn(Optional.of(existingTop));

    goalService.create(userId, request);

    var captor = org.mockito.ArgumentCaptor.forClass(Goal.class);
    verify(goalRepository).save(captor.capture());
    assertThat(captor.getValue().getPosition()).isEqualTo(2048.0);
  }

  @Test
  void create_withIdAlreadyOwnedByCaller_isIdempotentAndDoesNotSaveAgain() {
    UUID userId = UUID.randomUUID();
    CreateGoalRequest request = new CreateGoalRequest(UUID.randomUUID(), "week", "Meta");
    Goal existing = new Goal();
    existing.setId(request.id());
    existing.setUserId(userId);
    when(goalRepository.findById(request.id())).thenReturn(Optional.of(existing));

    goalService.create(userId, request);

    verify(goalRepository, never()).save(any());
  }

  @Test
  void create_withIdOwnedByAnotherUser_throwsConflict() {
    UUID userId = UUID.randomUUID();
    CreateGoalRequest request = new CreateGoalRequest(UUID.randomUUID(), "week", "Meta");
    Goal existing = new Goal();
    existing.setId(request.id());
    existing.setUserId(UUID.randomUUID());
    when(goalRepository.findById(request.id())).thenReturn(Optional.of(existing));

    assertThatThrownBy(() -> goalService.create(userId, request)).isInstanceOf(ConflictException.class);
  }

  @Test
  void delete_withAnotherUsersGoal_throwsNotFound() {
    UUID userId = UUID.randomUUID();
    UUID goalId = UUID.randomUUID();
    when(goalRepository.findByIdAndUserId(goalId, userId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> goalService.delete(userId, goalId)).isInstanceOf(NotFoundException.class);
  }
}
