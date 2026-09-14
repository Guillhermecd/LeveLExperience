package br.com.oaksd.kanban.service;

import br.com.oaksd.kanban.dto.response.BoardResponse;
import br.com.oaksd.kanban.dto.response.MeExportResponse;
import br.com.oaksd.kanban.dto.response.XpEventResponse;
import br.com.oaksd.kanban.entity.User;
import br.com.oaksd.kanban.exception.NotFoundException;
import br.com.oaksd.kanban.mapper.FocusSessionMapper;
import br.com.oaksd.kanban.mapper.UserMapper;
import br.com.oaksd.kanban.repository.FocusSessionRepository;
import br.com.oaksd.kanban.repository.UserRepository;
import br.com.oaksd.kanban.repository.XpEventRepository;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MeService {

  private final UserRepository userRepository;
  private final XpEventRepository xpEventRepository;
  private final FocusSessionRepository focusSessionRepository;
  private final UserMapper userMapper;
  private final FocusSessionMapper focusSessionMapper;
  private final BoardService boardService;
  private final StatsService statsService;

  public MeService(UserRepository userRepository, XpEventRepository xpEventRepository,
      FocusSessionRepository focusSessionRepository, UserMapper userMapper,
      FocusSessionMapper focusSessionMapper, BoardService boardService, StatsService statsService) {
    this.userRepository = userRepository;
    this.xpEventRepository = xpEventRepository;
    this.focusSessionRepository = focusSessionRepository;
    this.userMapper = userMapper;
    this.focusSessionMapper = focusSessionMapper;
    this.boardService = boardService;
    this.statsService = statsService;
  }

  @Transactional(readOnly = true)
  public MeExportResponse export(UUID userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));

    BoardResponse board = boardService.getBoard(userId);
    var xpEvents = xpEventRepository.findByUserIdOrderByDayAsc(userId).stream()
        .map(e -> new XpEventResponse(e.getId(), e.getDay(), e.getDelta(), e.getReason(), e.getRefId(),
            e.getCreatedAt()))
        .toList();
    var focusSessions = focusSessionRepository.findByUserIdOrderByStartedAtAsc(userId).stream()
        .map(focusSessionMapper::toResponse)
        .toList();

    return new MeExportResponse(userMapper.toResponse(user), board.cards(), board.goals(), xpEvents, focusSessions,
        statsService.getStats(userId));
  }

  // users(id) ON DELETE CASCADE covers cards, goals, xp_events,
  // focus_sessions, auth_tokens and refresh_tokens (V1__initial_schema.sql) —
  // one delete, no orphan cleanup needed (GATES.md 3.4).
  @Transactional
  public void deleteAccount(UUID userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));
    userRepository.delete(user);
  }
}
