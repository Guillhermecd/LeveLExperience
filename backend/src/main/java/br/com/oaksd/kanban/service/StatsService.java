package br.com.oaksd.kanban.service;

import br.com.oaksd.kanban.dto.response.DayHistoryEntry;
import br.com.oaksd.kanban.dto.response.StatsResponse;
import br.com.oaksd.kanban.entity.User;
import br.com.oaksd.kanban.entity.UserStats;
import br.com.oaksd.kanban.entity.XpEvent;
import br.com.oaksd.kanban.exception.NotFoundException;
import br.com.oaksd.kanban.repository.UserRepository;
import br.com.oaksd.kanban.repository.UserStatsRepository;
import br.com.oaksd.kanban.repository.XpEventRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StatsService {

  private static final int HISTORY_DAYS = 14;

  private final UserRepository userRepository;
  private final UserStatsRepository userStatsRepository;
  private final XpEventRepository xpEventRepository;
  private final XpRuleEngine xpRuleEngine;

  public StatsService(UserRepository userRepository, UserStatsRepository userStatsRepository,
      XpEventRepository xpEventRepository, XpRuleEngine xpRuleEngine) {
    this.userRepository = userRepository;
    this.userStatsRepository = userStatsRepository;
    this.xpEventRepository = xpEventRepository;
    this.xpRuleEngine = xpRuleEngine;
  }

  @Transactional(readOnly = true)
  public StatsResponse getStats(UUID userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));
    UserStats stats = userStatsRepository.findById(userId)
        .orElseThrow(() -> new IllegalStateException("user_stats ausente para o usuário " + userId));

    LocalDate today = LocalDate.now(ZoneId.of(user.getTimezone()));
    LocalDate since = today.minusDays(HISTORY_DAYS - 1L);

    // dayXp/dayDone are derived here, never stored (same reasoning as
    // user_stats.xp_total in XpService) — cheap because they only ever
    // scan the last 14 days off xp_events_user_day_idx.
    Map<LocalDate, int[]> byDay = new HashMap<>();
    for (XpEvent event : xpEventRepository.findByUserIdAndDayGreaterThanEqualOrderByDayAsc(userId, since)) {
      int[] aggregate = byDay.computeIfAbsent(event.getDay(), d -> new int[2]);
      aggregate[0] += event.getDelta();
      aggregate[1] += dayDoneDelta(event.getReason());
    }

    List<DayHistoryEntry> history = new ArrayList<>();
    for (LocalDate day = since; !day.isAfter(today); day = day.plusDays(1)) {
      int[] aggregate = byDay.getOrDefault(day, new int[2]);
      history.add(new DayHistoryEntry(day, aggregate[0], aggregate[1]));
    }

    int xpTotal = stats.getXpTotal();
    XpRuleEngine.LevelInfo levelInfo = xpRuleEngine.getLevelInfo(xpTotal);
    int streak = xpRuleEngine.isStreakAlive(stats.getLastXpDay(), today) ? stats.getStreak() : 0;
    int[] todayAggregate = byDay.getOrDefault(today, new int[2]);

    return new StatsResponse(xpTotal, levelInfo.level(), levelInfo.rank(), levelInfo.xpIntoLevel(),
        levelInfo.xpForNextLevel(), streak, stats.getLastXpDay(), todayAggregate[0], todayAggregate[1], history);
  }

  private static int dayDoneDelta(String reason) {
    return switch (reason) {
      case "card_done", "goal_done" -> 1;
      case "card_undone", "goal_undone" -> -1;
      default -> 0;
    };
  }
}
