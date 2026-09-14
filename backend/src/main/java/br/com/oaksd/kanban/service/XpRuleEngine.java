package br.com.oaksd.kanban.service;

import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * XP arithmetic — the single Java copy of the rules in xp-rules.json (mirrors
 * frontend/src/features/kanban/levels.ts and actions/*.ts). Every settlement path
 * (move, goal/subtask toggle, focus session) and {@code XpRulesTableTest} call into this,
 * so a rule change breaks both call sites instead of silently diverging.
 */
@Component
public class XpRuleEngine {

  private final XpRulesTable table;
  private final int baseCost;
  private final int costIncrement;

  public XpRuleEngine() {
    this(XpRulesTableLoader.load());
  }

  public XpRuleEngine(XpRulesTable table) {
    this.table = table;
    this.baseCost = table.levels().get(0).cost();
    this.costIncrement = table.levels().get(1).cost() - table.levels().get(0).cost();
  }

  public int cardXp(short priority) {
    Integer xp = table.xpCardByPriority().get(priority);
    if (xp == null) {
      throw new IllegalArgumentException("Prioridade de card desconhecida: " + priority);
    }
    return xp;
  }

  public int goalXp(String scope) {
    Integer xp = table.xpGoalByScope().get(scope);
    if (xp == null) {
      throw new IllegalArgumentException("Escopo de meta desconhecido: " + scope);
    }
    return xp;
  }

  public int subtaskXp() {
    return table.xpSubtask();
  }

  public int cleanDayXp() {
    return table.xpCleanDay();
  }

  public int focusXp(int plannedMinutes, int elapsedMinutes) {
    return Math.max(table.xpFocusMinimum(), Math.min(elapsedMinutes, plannedMinutes));
  }

  // Extrapolates past the static table using the same arithmetic step (levels.ts:7-10).
  private int costForLevel(int level) {
    int index = level - 1;
    if (index < table.levels().size()) {
      return table.levels().get(index).cost();
    }
    return baseCost + (level - 1) * costIncrement;
  }

  private String rankForLevel(int level) {
    List<String> ranks = table.ranks();
    return ranks.get(Math.min(level - 1, ranks.size() - 1));
  }

  /** Level is always derived from a total, never stored — mirrors levels.ts:24-41. */
  public LevelInfo getLevelInfo(int xpTotal) {
    int level = 1;
    int threshold = 0;
    int cost = costForLevel(level);
    while (xpTotal >= threshold + cost) {
      threshold += cost;
      level += 1;
      cost = costForLevel(level);
    }
    return new LevelInfo(level, rankForLevel(level), xpTotal - threshold, cost);
  }

  public boolean isYesterday(LocalDate lastXpDay, LocalDate today) {
    return lastXpDay != null && lastXpDay.equals(today.minusDays(1));
  }

  public boolean isStreakAlive(LocalDate lastXpDay, LocalDate today) {
    return lastXpDay != null && (lastXpDay.equals(today) || isYesterday(lastXpDay, today));
  }

  public record LevelInfo(int level, String rank, int xpIntoLevel, int xpForNextLevel) {
  }
}
