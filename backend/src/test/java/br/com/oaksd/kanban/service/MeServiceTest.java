package br.com.oaksd.kanban.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.oaksd.kanban.entity.User;
import br.com.oaksd.kanban.exception.NotFoundException;
import br.com.oaksd.kanban.mapper.FocusSessionMapper;
import br.com.oaksd.kanban.mapper.UserMapper;
import br.com.oaksd.kanban.repository.FocusSessionRepository;
import br.com.oaksd.kanban.repository.UserRepository;
import br.com.oaksd.kanban.repository.XpEventRepository;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MeServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private XpEventRepository xpEventRepository;
  @Mock private FocusSessionRepository focusSessionRepository;
  @Mock private UserMapper userMapper;
  @Mock private FocusSessionMapper focusSessionMapper;
  @Mock private BoardService boardService;
  @Mock private StatsService statsService;

  private MeService meService;

  @BeforeEach
  void setUp() {
    meService = new MeService(userRepository, xpEventRepository, focusSessionRepository, userMapper,
        focusSessionMapper, boardService, statsService);
  }

  @Test
  void deleteAccount_removesTheUserRow_cascadeHandlesTheRest() {
    UUID userId = UUID.randomUUID();
    User user = new User();
    user.setId(userId);
    when(userRepository.findById(userId)).thenReturn(Optional.of(user));

    meService.deleteAccount(userId);

    verify(userRepository).delete(user);
  }

  @Test
  void deleteAccount_onUnknownUser_throwsNotFound() {
    UUID userId = UUID.randomUUID();
    when(userRepository.findById(userId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> meService.deleteAccount(userId)).isInstanceOf(NotFoundException.class);
    verify(userRepository, never()).delete(any());
  }

  @Test
  void export_onUnknownUser_throwsNotFound() {
    UUID userId = UUID.randomUUID();
    when(userRepository.findById(userId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> meService.export(userId)).isInstanceOf(NotFoundException.class);
  }
}
