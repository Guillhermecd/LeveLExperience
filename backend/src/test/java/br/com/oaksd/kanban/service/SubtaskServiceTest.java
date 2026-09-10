package br.com.oaksd.kanban.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import br.com.oaksd.kanban.dto.request.UpdateSubtaskRequest;
import br.com.oaksd.kanban.entity.Subtask;
import br.com.oaksd.kanban.exception.NotFoundException;
import br.com.oaksd.kanban.mapper.SubtaskMapper;
import br.com.oaksd.kanban.repository.CardRepository;
import br.com.oaksd.kanban.repository.SubtaskRepository;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SubtaskServiceTest {

  @Mock private SubtaskRepository subtaskRepository;
  @Mock private CardRepository cardRepository;
  @Mock private SubtaskMapper subtaskMapper;

  private SubtaskService subtaskService;

  @BeforeEach
  void setUp() {
    subtaskService = new SubtaskService(subtaskRepository, cardRepository, new PositionService(), subtaskMapper);
  }

  // Decision #12: a subtask that exists but belongs to someone else's card
  // must 404 exactly like a subtask that doesn't exist — never 403, which
  // would confirm the id is real.
  @Test
  void update_onSubtaskOfAnotherUsersCard_throwsNotFound() {
    UUID userId = UUID.randomUUID();
    UUID subtaskId = UUID.randomUUID();
    Subtask subtask = new Subtask();
    subtask.setId(subtaskId);
    subtask.setCardId(UUID.randomUUID());
    when(subtaskRepository.findById(subtaskId)).thenReturn(Optional.of(subtask));
    when(cardRepository.findByIdAndUserId(subtask.getCardId(), userId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> subtaskService.update(userId, subtaskId, new UpdateSubtaskRequest("nova")))
        .isInstanceOf(NotFoundException.class);
  }

  @Test
  void update_onNonExistentSubtask_throwsNotFound() {
    UUID userId = UUID.randomUUID();
    UUID subtaskId = UUID.randomUUID();
    when(subtaskRepository.findById(subtaskId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> subtaskService.update(userId, subtaskId, new UpdateSubtaskRequest("nova")))
        .isInstanceOf(NotFoundException.class);
  }
}
