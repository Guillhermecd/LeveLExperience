package br.com.oaksd.kanban.service;

import br.com.oaksd.kanban.entity.UserStats;
import br.com.oaksd.kanban.repository.UserStatsRepository;
import br.com.oaksd.kanban.repository.XpEventRepository;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Records one XP event and updates its cache (PLAN.md item 4/5, GATES.md 3.8/3.9). Always called
 * from inside the caller's own @Transactional (move, toggle, focus finish) — never opens a
 * transaction of its own network call away from the DB.
 */
@Service
public class XpService {

  private final XpEventInserter xpEventInserter;
  private final XpEventRepository xpEventRepository;
  private final UserStatsRepository userStatsRepository;
  private final XpRuleEngine xpRuleEngine;

  public XpService(XpEventInserter xpEventInserter, XpEventRepository xpEventRepository,
      UserStatsRepository userStatsRepository, XpRuleEngine xpRuleEngine) {
    this.xpEventInserter = xpEventInserter;
    this.xpEventRepository = xpEventRepository;
    this.userStatsRepository = userStatsRepository;
    this.xpRuleEngine = xpRuleEngine;
  }

  @Transactional
  public void settle(UUID userId, String reason, int delta, UUID refId, String idempotencyKey, LocalDate day) {
    boolean inserted = xpEventInserter.insertIfAbsent(userId, reason, delta, refId, idempotencyKey, day);
    if (!inserted) {
      // Same key already recorded (retry, double click, duplicated tab): the
      // ledger and user_stats already reflect this event, nothing to redo.
      return;
    }

    UserStats stats = userStatsRepository.lockByUserId(userId)
        .orElseThrow(() -> new IllegalStateException("user_stats ausente para o usuário " + userId));

    // Streak/lastXpDay only move on the first positive event of the day
    // (mirrors applyEvent.ts:17-22); a reversal never starts or extends one.
    if (delta > 0 && !day.equals(stats.getLastXpDay())) {
      boolean yesterday = xpRuleEngine.isYesterday(stats.getLastXpDay(), day);
      stats.setStreak(yesterday ? stats.getStreak() + 1 : 1);
      stats.setLastXpDay(day);
    }

    int rawTotal = xpEventRepository.sumDeltaByUserId(userId);
    stats.setXpTotal(Math.max(0, rawTotal));
    userStatsRepository.save(stats);
  }
}
